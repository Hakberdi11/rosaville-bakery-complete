from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.EMPLOYEE)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user: email is the login identifier, role drives permissions
    the same way Base44's per-entity RLS role checks used to."""

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Manager"
        EMPLOYEE = "employee", "Employee"
        CUSTOMER = "customer", "Customer"

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)

    # Profile / business-settings fields read by the dashboard's Settings & CMS pages.
    full_name = models.CharField(max_length=255, blank=True)
    business_name = models.CharField(max_length=255, blank=True)
    business_email = models.EmailField(blank=True)
    business_phone = models.CharField(max_length=20, blank=True)
    business_address = models.CharField(max_length=500, blank=True)
    currency = models.CharField(max_length=10, blank=True, default="USD")
    tagline = models.CharField(max_length=255, blank=True)
    low_stock_alerts = models.BooleanField(default=True)
    new_order_alerts = models.BooleanField(default=True)
    feedback_alerts = models.BooleanField(default=True)
    max_gallery_items = models.PositiveIntegerField(default=12)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def is_admin_or_manager(self):
        return self.role in (self.Role.ADMIN, self.Role.MANAGER)
