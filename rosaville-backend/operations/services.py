"""Order-fulfillment ↔ inventory logic that spans multiple InventoryItem rows
and reads Dessert from the catalog app — kept out of models.py (which owns
single-row logic like InventoryItem.apply_stock_movement) and out of views.py
(which should stay thin)."""

from decimal import ROUND_HALF_UP, Decimal

from django.db.models import Sum
from rest_framework.exceptions import ValidationError

from catalog.models import Dessert

from .models import InventoryItem, LoyaltySettings, StockMovement

# Python port of ingredientCalc.js's CONVERSIONS table — must stay in sync
# with rosaville-admin-dashboard/src/lib/ingredientCalc.js if that changes.
UNIT_CONVERSIONS = {
    "kg": {"g": Decimal("1000"), "lb": Decimal("2.20462"), "oz": Decimal("35.274")},
    "g": {"kg": Decimal("0.001"), "lb": Decimal("0.00220462"), "oz": Decimal("0.035274")},
    "lb": {"kg": Decimal("0.453592"), "g": Decimal("453.592"), "oz": Decimal("16")},
    "oz": {"kg": Decimal("0.0283495"), "g": Decimal("28.3495"), "lb": Decimal("0.0625")},
    "L": {"ml": Decimal("1000")},
    "ml": {"L": Decimal("0.001")},
}


def convert_unit(quantity, from_unit, to_unit):
    if not from_unit or not to_unit or from_unit == to_unit:
        return quantity
    if from_unit in UNIT_CONVERSIONS and to_unit in UNIT_CONVERSIONS[from_unit]:
        return quantity * UNIT_CONVERSIONS[from_unit][to_unit]
    if to_unit in UNIT_CONVERSIONS and from_unit in UNIT_CONVERSIONS[to_unit]:
        return quantity / UNIT_CONVERSIONS[to_unit][from_unit]
    return quantity  # unknown pairing — assume 1:1, same as the JS original


def calculate_order_ingredient_consumption(order):
    """Python port of ingredientCalc.js's calculateOrderIngredients, plus the
    unit-conversion step calculateProjectedStock/calculateOrdersCOGS apply on
    top of it. Returns {inventory_item_id: Decimal quantity}, already
    converted to each InventoryItem's own stocked unit. Must stay in sync with
    that file if the size/ingredient-override logic changes there."""
    items = order.items or []

    dessert_ids = set()
    for it in items:
        did = it.get("dessert_id")
        if did is not None and str(did).strip().isdigit():
            dessert_ids.add(int(did))
    desserts_by_id = {d.id: d for d in Dessert.objects.filter(id__in=dessert_ids)}

    # inventory_item_id (str, as stored in the ingredient JSON) -> [(qty, unit), ...]
    raw_consumption = {}
    for it in items:
        did = it.get("dessert_id")
        dessert = desserts_by_id.get(int(did)) if did is not None and str(did).strip().isdigit() else None
        if not dessert:
            continue  # dessert deleted/unlinked since the order was placed — skip, don't error
        size = next((s for s in (dessert.sizes or []) if s.get("label") == it.get("size")), None)
        ingredients = dessert.ingredients or []
        multiplier = Decimal(str(it.get("size_multiplier") or 1)) * Decimal(str(it.get("quantity") or 1))
        if size and size.get("ingredients"):
            ingredients = size["ingredients"]
            multiplier = Decimal(str(it.get("quantity") or 1))
        for ing in ingredients:
            inv_id = ing.get("inventory_item_id")
            if not inv_id:
                continue
            qty = Decimal(str(ing.get("quantity") or 0)) * multiplier
            raw_consumption.setdefault(str(inv_id), []).append((qty, ing.get("unit")))

    if not raw_consumption:
        return {}

    inv_ids = [int(k) for k in raw_consumption if k.isdigit()]
    inventory_items = {i.id: i for i in InventoryItem.objects.filter(id__in=inv_ids)}

    result = {}
    for inv_id_str, entries in raw_consumption.items():
        if not inv_id_str.isdigit():
            continue
        item = inventory_items.get(int(inv_id_str))
        if not item:
            continue  # inventory item deleted since the recipe was set — skip
        total = sum((convert_unit(qty, unit, item.unit) for qty, unit in entries), Decimal("0"))
        result[item.id] = total
    return result


def deduct_order_ingredients(order):
    consumption = calculate_order_ingredient_consumption(order)
    if not consumption:
        return
    items = {i.id: i for i in InventoryItem.objects.filter(id__in=consumption.keys())}
    for inv_id, qty in consumption.items():
        item = items.get(inv_id)
        if not item or qty == 0:
            continue
        item.apply_stock_movement(
            movement_type=StockMovement.MovementType.PRODUCTION_USE,
            quantity_delta=-qty,
            related_order=order,
        )


def order_deduction_net_by_item(order):
    """{inventory_item_id: net Decimal} across this order's Production Use
    movements — used both to guard against double-deduction and to know
    exactly how much to restore on cancellation."""
    rows = (
        StockMovement.objects.filter(related_order=order, movement_type=StockMovement.MovementType.PRODUCTION_USE)
        .values("inventory_item_id")
        .annotate(net=Sum("quantity_delta"))
    )
    return {r["inventory_item_id"]: r["net"] for r in rows if r["net"]}


def reverse_order_ingredient_deduction(order):
    net_by_item = order_deduction_net_by_item(order)
    if not net_by_item:
        return
    items = {i.id: i for i in InventoryItem.objects.filter(id__in=net_by_item.keys())}
    for inv_id, net in net_by_item.items():
        if net >= 0:
            continue  # nothing outstanding to restore for this item
        item = items.get(inv_id)
        if not item:
            continue
        item.apply_stock_movement(
            movement_type=StockMovement.MovementType.PRODUCTION_USE,
            quantity_delta=-net,  # net is negative, so this is a positive restore
            related_order=order,
            reason="Order cancelled — ingredients restored",
        )


# --- Server-authoritative order pricing -------------------------------------
# Nothing a client POSTs to /api/orders/ may decide what an order costs. The
# storefront's Checkout still computes a total for display, but the number that
# gets stored is always recomputed here from the current catalog + the
# owner-configured LoyaltySettings. See LoyaltySettings for why: the reward has
# to be derived from server-held state, never from a value the browser sends.

TWO_PLACES = Decimal("0.01")


def _money(value):
    return Decimal(str(value or 0)).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def resolve_line_unit_price(dessert, item):
    """Authoritative unit price for one order line, ignoring whatever `price`
    the client sent. Size pricing mirrors the dashboard's CreateOrderDialog:
    an explicit per-size price wins, else the size multiplier scales the base
    price, else the base price stands on its own."""
    size_label = item.get("size")
    size = next((s for s in (dessert.sizes or []) if s.get("label") == size_label), None) if size_label else None
    if size and size.get("price") not in (None, ""):
        return _money(size["price"])
    if size and size.get("multiplier"):
        return _money(dessert.price * Decimal(str(size["multiplier"])))
    return _money(dessert.price)


def price_order_items(items, allow_off_menu=False):
    """Returns (priced_items, subtotal). `priced_items` is a copy of `items`
    with `price` (and `name`) overwritten from the catalog, so the stored order
    record can't disagree with the total.

    `allow_off_menu=True` (staff-created walk-in/phone orders) lets a line
    without a resolvable dessert_id keep its submitted price — that's a
    legitimate custom quote. On the public checkout path it's a hard error:
    an unknown dessert_id is the obvious way to smuggle in an arbitrary price.
    """
    items = items or []
    dessert_ids = {
        int(it["dessert_id"])
        for it in items
        if str(it.get("dessert_id") or "").strip().isdigit()
    }
    desserts_by_id = {d.id: d for d in Dessert.objects.filter(id__in=dessert_ids)}

    priced_items = []
    subtotal = Decimal("0")
    for index, item in enumerate(items):
        line = dict(item)
        raw_id = str(item.get("dessert_id") or "").strip()
        dessert = desserts_by_id.get(int(raw_id)) if raw_id.isdigit() else None

        try:
            quantity = int(Decimal(str(item.get("quantity") or 0)))
        except (ArithmeticError, ValueError):
            quantity = 0
        if quantity < 1:
            raise ValidationError({"items": f"Line {index + 1}: quantity must be at least 1."})
        line["quantity"] = quantity

        if dessert is None:
            if not allow_off_menu:
                raise ValidationError({"items": f"Line {index + 1}: this item is no longer available."})
            unit_price = _money(item.get("price"))
        else:
            unit_price = resolve_line_unit_price(dessert, item)
            line["name"] = dessert.name

        # float, not Decimal: `items` is a JSONField and json.dumps can't
        # serialize Decimal. Money math stays in Decimal via `subtotal`.
        line["price"] = float(unit_price)
        subtotal += unit_price * quantity
        priced_items.append(line)

    return priced_items, _money(subtotal)


def compute_loyalty_discount(subtotal, loyalty_settings):
    """The reward is worth whatever the owner's LoyaltySettings say it's worth,
    full stop — the client never gets a say in the amount."""
    if not loyalty_settings.enabled:
        return Decimal("0.00")
    if loyalty_settings.reward_type == LoyaltySettings.RewardType.PERCENT_OFF:
        pct = max(Decimal("0"), min(Decimal("100"), Decimal(str(loyalty_settings.reward_value))))
        return _money(subtotal * pct / Decimal("100"))
    return _money(min(Decimal(str(loyalty_settings.reward_value)), subtotal))
