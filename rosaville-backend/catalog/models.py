from django.db import models


class Dessert(models.Model):
    """Unifies Base44's `Dessert` entity and front-last's old `menuItems` table —
    the dashboard manages these, the public site reads them."""

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="Signature Cakes")
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Plain string, not an ImageField/URLField: actual file storage happens via
    # the separate /api/upload/ endpoint, which returns a URL. This field just
    # stores that URL over JSON — an ImageField would reject the write (only
    # accepts multipart file data), and URLField would reject relative paths
    # like the local "/placeholder-dessert.svg" fallback used by both frontends.
    featured_image = models.CharField(max_length=500, blank=True, default="")
    images = models.JSONField(default=list, blank=True)  # extra gallery image URLs

    ingredients = models.JSONField(default=list, blank=True)  # [{inventory_item_id, name, quantity, unit}]
    sizes = models.JSONField(default=list, blank=True)  # [{label, multiplier, price, ingredients}]
    allergens = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)

    # Automatic-pricing inputs (see operations.PricingSettings for the
    # business-wide labor rate/default margin these combine with). Ingredient
    # cost itself isn't stored here — it's always computed live from
    # `ingredients`/`sizes` against current InventoryItem.cost_per_unit.
    labor_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)  # hours to produce one batch
    batch_yield = models.PositiveIntegerField(default=1)  # units produced per batch
    packaging_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)  # per unit
    # null = inherit PricingSettings.category_margin_overrides[category], then
    # PricingSettings.target_margin_percent — see ingredientCalc.js's calculateSuggestedPrice.
    target_margin_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    preparation_time = models.CharField(max_length=100, blank=True)
    availability = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    seasonal = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    # Curated selection shown on the dashboard's Gallery page — not every
    # dessert with a photo, only the ones explicitly picked via "Add from Menu".
    in_gallery = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "-created_at"]

    def __str__(self):
        return self.name


class SpecialOfMonth(models.Model):
    """History of "dessert of the month" picks. Only one row has
    `is_active=True` at a time — that's the one the public site shows.
    Activating a new one deactivates the rest (see SpecialOfMonthViewSet),
    so the inactive rows form the archive."""

    dessert = models.ForeignKey(Dessert, on_delete=models.CASCADE, related_name="specials")
    month_label = models.CharField(max_length=100, help_text='e.g. "August 2026"')
    title = models.CharField(max_length=255, blank=True, help_text="Defaults to the dessert's name if left blank")
    story = models.TextField(blank=True, help_text="Defaults to the dessert's description if left blank")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.month_label}: {self.title or self.dessert.name}"
