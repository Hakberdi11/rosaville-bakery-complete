from rest_framework.routers import DefaultRouter

from .views import DessertViewSet, SpecialOfMonthViewSet

router = DefaultRouter()
router.register("desserts", DessertViewSet, basename="dessert")
router.register("specials", SpecialOfMonthViewSet, basename="specialofmonth")

urlpatterns = router.urls
