from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ContactRequestViewSet,
    CustomCakeOrderViewSet,
    NewsletterSubscriberViewSet,
    SiteContentView,
    TeamMemberViewSet,
)

router = DefaultRouter()
router.register("contact-requests", ContactRequestViewSet, basename="contactrequest")
router.register("custom-cake-orders", CustomCakeOrderViewSet, basename="customcakeorder")
router.register("team-members", TeamMemberViewSet, basename="teammember")
router.register("newsletter-subscribers", NewsletterSubscriberViewSet, basename="newslettersubscriber")

urlpatterns = [
    path("site-content/", SiteContentView.as_view(), name="site-content"),
] + router.urls
