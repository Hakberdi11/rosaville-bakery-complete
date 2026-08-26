import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.conf import settings
from rest_framework import filters, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .emails import send_password_reset_email, send_temp_password_email
from .permissions import IsAdminOnly
from .serializers import (
    EmailTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserAdminSerializer,
    UserSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RegisterView(APIView):
    """Public storefront signup: creates a customer-role User and links it to
    an existing Customer CRM row (matched by email, e.g. from a past guest
    checkout) or creates a new one. Returns tokens immediately so the
    frontend can log the user in without a second round-trip."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        from operations.models import Customer

        customer = Customer.objects.filter(email__iexact=user.email).first()
        if customer:
            customer.user = user
            customer.save(update_fields=["user"])
        else:
            Customer.objects.create(name=user.full_name or user.email, email=user.email, user=user)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=201,
        )


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    """Step 1 of the forgot-password flow, shared by both frontends (a
    customer on the public site or a staff member on the dashboard — the
    reset link just points at whichever app's /reset-password page based on
    role). Always returns 200 with a generic message regardless of whether
    the email matched an account, so this can't be used to enumerate users."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            base_url = settings.FRONTEND_URL if user.role == User.Role.CUSTOMER else settings.DASHBOARD_URL
            reset_url = f"{base_url}/reset-password?uid={uid}&token={token}"
            send_password_reset_email(user, reset_url)

        return Response({"detail": "If an account exists with that email, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    """Step 2: consumes the uid/token from the emailed link and sets a new
    password. default_token_generator tokens are single-use (invalidated by
    the password change itself) and time-limited (PASSWORD_RESET_TIMEOUT,
    Django default 3 days)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid or expired reset link."}, status=400)

        if not default_token_generator.check_token(user, data["token"]):
            return Response({"detail": "Invalid or expired reset link."}, status=400)

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated. You can now log in."})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except Exception:
                pass
        return Response({"success": True})


class UserViewSet(viewsets.ModelViewSet):
    """Employees page: list staff accounts, create (with a generated temp
    password, emailed to the new hire when EMAIL_HOST is configured — always
    also returned in the response as an on-screen fallback, since email
    delivery is best-effort and may not be set up), update role, delete."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserAdminSerializer
    permission_classes = [IsAdminOnly]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        role = request.data.get("role", User.Role.EMPLOYEE)
        if not email:
            return Response({"error": "email is required"}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists"}, status=400)
        temp_password = secrets.token_urlsafe(9)
        user = User.objects.create_user(email=email, password=temp_password, role=role)
        send_temp_password_email(user, temp_password)
        data = UserAdminSerializer(user).data
        data["temp_password"] = temp_password
        return Response(data, status=201)
