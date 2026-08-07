from rest_framework import filters, generics, viewsets
from rest_framework.permissions import AllowAny

from accounts.permissions import CreateOnlyOrIsStaff, IsStaff, ReadOnlyOrIsStaff

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
    http_method_names = ["get", "post", "head", "options"]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


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
