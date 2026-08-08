from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet,
    FeedbackViewSet,
    GiftCardViewSet,
    InventoryItemViewSet,
    OrderViewSet,
    SupplierViewSet,
    TaskViewSet,
)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("suppliers", SupplierViewSet, basename="supplier")
router.register("inventory", InventoryItemViewSet, basename="inventoryitem")
router.register("orders", OrderViewSet, basename="order")
router.register("gift-cards", GiftCardViewSet, basename="giftcard")
router.register("feedback", FeedbackViewSet, basename="feedback")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = router.urls
