from rest_framework import filters, generics, viewsets
from rest_framework.permissions import AllowAny

from accounts.permissions import CreateOnlyOrIsStaff, IsStaff, ReadOnlyOrIsStaff

from .brevo import sync_subscriber
from .models import ContactRequest, CustomCakeOrder, NewsletterSubscriber, SiteContent, TeamMember
from .serializers import (
    ContactRequestSerializer,
    CustomCakeOrderSerializer,
    NewsletterSubscriberSerializer,
    SiteContentSerializer,
    TeamMemberSerializer,
)


class ContactRequestViewSet(viewsets.ModelViewSet):
    queryset = ContactRequest.objects.all()
    serializer_class = ContactRequestSerializer
    permission_classes = [CreateOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class CustomCakeOrderViewSet(viewsets.ModelViewSet):
    queryset = CustomCakeOrder.objects.all()
    serializer_class = CustomCakeOrderSerializer
    permission_classes = [CreateOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [ReadOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class NewsletterSubscriberViewSet(viewsets.ModelViewSet):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [CreateOnlyOrIsStaff]
    # PUT/PATCH deliberately still excluded — a subscriber row is either there
    # or not, nothing on it is staff-editable. DELETE is allowed so staff can
    # remove test/bounced/unsubscribed entries from the Newsletter page.
    http_method_names = ["get", "post", "delete", "head", "options"]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def perform_create(self, serializer):
        instance = serializer.save()
        sync_subscriber(instance.email)


class SiteContentView(generics.RetrieveUpdateAPIView):
    """Singleton resource: public read (both frontends need it, front-last
    with no auth at all), staff-only write (dashboard's CMS page)."""

    serializer_class = SiteContentSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsStaff()]
        return [AllowAny()]

    def get_object(self):
        return SiteContent.load()
