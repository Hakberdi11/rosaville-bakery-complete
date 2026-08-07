import secrets

from django.contrib.auth import get_user_model
from rest_framework import filters, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminOnly
from .serializers import EmailTokenObtainPairSerializer, UserAdminSerializer, UserSerializer

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


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
    password — there's no email delivery configured), update role, delete."""

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
        data = UserAdminSerializer(user).data
        data["temp_password"] = temp_password
        return Response(data, status=201)
