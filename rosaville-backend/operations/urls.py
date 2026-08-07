from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, FeedbackViewSet, InventoryItemViewSet, OrderViewSet, TaskViewSet

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("inventory", InventoryItemViewSet, basename="inventoryitem")
router.register("orders", OrderViewSet, basename="order")
router.register("feedback", FeedbackViewSet, basename="feedback")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = router.urls
