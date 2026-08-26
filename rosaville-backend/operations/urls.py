from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet,
    FeedbackViewSet,
    GiftCardViewSet,
    InventoryItemViewSet,
    LoyaltySettingsView,
    OrderViewSet,
    PricingSettingsView,
    PurchaseOrderViewSet,
    StockMovementViewSet,
    SupplierViewSet,
    TaskViewSet,
)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("suppliers", SupplierViewSet, basename="supplier")
router.register("inventory", InventoryItemViewSet, basename="inventoryitem")
router.register("stock-movements", StockMovementViewSet, basename="stockmovement")
router.register("purchase-orders", PurchaseOrderViewSet, basename="purchaseorder")
router.register("orders", OrderViewSet, basename="order")
router.register("gift-cards", GiftCardViewSet, basename="giftcard")
router.register("feedback", FeedbackViewSet, basename="feedback")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("pricing-settings/", PricingSettingsView.as_view(), name="pricing-settings"),
    path("loyalty-settings/", LoyaltySettingsView.as_view(), name="loyalty-settings"),
] + router.urls
