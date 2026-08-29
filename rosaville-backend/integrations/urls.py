from django.urls import path

from .views import AccountsListView, AnalyticsView, CallbackView, ConnectView, DisconnectView

urlpatterns = [
    path("integrations/accounts/", AccountsListView.as_view(), name="social-accounts"),
    path("integrations/<str:platform>/connect/", ConnectView.as_view(), name="social-connect"),
    path("integrations/<str:platform>/callback/", CallbackView.as_view(), name="social-callback"),
    path("integrations/<str:platform>/disconnect/", DisconnectView.as_view(), name="social-disconnect"),
    path("integrations/<str:platform>/analytics/", AnalyticsView.as_view(), name="social-analytics"),
]
