"""Order-fulfillment ↔ inventory logic that spans multiple InventoryItem rows
and reads Dessert from the catalog app — kept out of models.py (which owns
single-row logic like InventoryItem.apply_stock_movement) and out of views.py
(which should stay thin)."""

from decimal import Decimal

from django.db.models import Sum

from catalog.models import Dessert

from .models import InventoryItem, StockMovement

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
