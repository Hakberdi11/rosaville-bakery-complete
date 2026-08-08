import random

from django.conf import settings
from django.db import models


class Customer(models.Model):
    class Segment(models.TextChoices):
        NEW = "New", "New"
        REGULAR = "Regular", "Regular"
        VIP = "VIP", "VIP"
        AT_RISK = "At Risk", "At Risk"

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=500, blank=True)
    total_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    order_count = models.IntegerField(default=0)
    last_order_date = models.DateField(null=True, blank=True)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tags = models.JSONField(default=list, blank=True)
    segment = models.CharField(max_length=20, choices=Segment.choices, default=Segment.NEW)
    notes = models.TextField(blank=True)
    # Simple punch-card style loyalty: 1 point per $1 spent, awarded automatically
    # when an Order's email matches this customer (see OrderViewSet.perform_create),
    # plus manual adjustment from the dashboard. Deliberately not a tiered/enterprise
    # loyalty system — see .claude/research/dashboard-gap-analysis.md item #2.
    loyalty_points = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    class Unit(models.TextChoices):
        KG = "kg", "kg"
        G = "g", "g"
        L = "L", "L"
        ML = "ml", "ml"
        PCS = "pcs", "pcs"
        BOX = "box", "box"

    name = models.CharField(max_length=255)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.KG)
    minimum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    supplier = models.CharField(max_length=255, blank=True)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.CharField(max_length=100, default="Other")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        CONFIRMED = "Confirmed", "Confirmed"
        IN_PRODUCTION = "In Production", "In Production"
        READY = "Ready", "Ready"
        DELIVERED = "Delivered", "Delivered"
        COMPLETED = "Completed", "Completed"
        CANCELLED = "Cancelled", "Cancelled"
        REFUNDED = "Refunded", "Refunded"

    class PaymentStatus(models.TextChoices):
        UNPAID = "Unpaid", "Unpaid"
        PAID = "Paid", "Paid"
        REFUNDED = "Refunded", "Refunded"
        PARTIALLY_PAID = "Partially Paid", "Partially Paid"

    class Channel(models.TextChoices):
        WEBSITE = "Website", "Website"
        PHONE = "Phone", "Phone"
        WALK_IN = "Walk-in", "Walk-in"
        WHOLESALE = "Wholesale", "Wholesale"

    order_number = models.CharField(max_length=50, blank=True)
    customer_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=500, blank=True)
    items = models.JSONField(default=list, blank=True)  # [{name, dessert_id, quantity, price, size, size_multiplier}]
    total_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gift_card_code = models.CharField(max_length=30, blank=True)
    gift_card_amount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    internal_notes = models.TextField(blank=True)
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.WEBSITE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        # front-last's Checkout never sets this (only the dashboard's manual
        # CreateOrderDialog does), so every order needs a fallback here to be
        # usable as a customer-facing lookup reference — see PublicOrderStatusSerializer.
        if not self.order_number:
            self.order_number = f"RV-{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number or f"Order #{self.pk}"


class GiftCard(models.Model):
    code = models.CharField(max_length=30, unique=True)
    initial_balance = models.DecimalField(max_digits=10, decimal_places=2)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2)
    recipient_name = models.CharField(max_length=255, blank=True)
    recipient_email = models.EmailField(blank=True)
    purchaser_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    # [{order_id, order_number, amount, date}], newest first — same JSON-log
    # pattern as Dessert.ingredients; no separate Redemption model needed yet.
    redemption_history = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.code


class Feedback(models.Model):
    class Source(models.TextChoices):
        WEBSITE = "Website", "Website"
        EMAIL = "Email", "Email"
        GOOGLE = "Google", "Google"
        FACEBOOK = "Facebook", "Facebook"
        INSTAGRAM = "Instagram", "Instagram"

    class Status(models.TextChoices):
        NEW = "New", "New"
        REVIEWED = "Reviewed", "Reviewed"
        FEATURED = "Featured", "Featured"
        ARCHIVED = "Archived", "Archived"

    customer_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    rating = models.IntegerField(default=5)
    message = models.TextField(blank=True)
    dessert_name = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WEBSITE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer_name} ({self.rating}★)"


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"
        URGENT = "Urgent", "Urgent"

    class Status(models.TextChoices):
        TODO = "To Do", "To Do"
        IN_PROGRESS = "In Progress", "In Progress"
        WAITING = "Waiting", "Waiting"
        COMPLETED = "Completed", "Completed"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks"
    )
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    notes = models.TextField(blank=True)
    module = models.CharField(max_length=100, default="General")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
