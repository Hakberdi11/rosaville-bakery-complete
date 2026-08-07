from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrManager(BasePermission):
    """Matches Base44 RLS rules where create/update/delete required admin OR manager."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "manager"))


class IsStaff(BasePermission):
    """Matches Base44 RLS rules requiring admin OR manager OR employee (any authenticated staff)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "manager", "employee"))


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")


class ReadOnlyOrIsStaff(BasePermission):
    """Public read, staff-only write — matches entities like Dessert (read: null)."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "manager", "employee"))


class CreateOnlyOrIsStaff(BasePermission):
    """Public create, staff-only read/update/delete — matches entities like Order,
    Feedback, ContactRequest whose RLS `create` rule is null (unrestricted)."""

    def has_permission(self, request, view):
        if request.method == "POST":
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "manager", "employee"))


class IsAdminOrManagerOrOwner(BasePermission):
    """Matches Task's RLS: admin/manager always, or the assignee for read/update
    of their own task."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "manager", "employee"))

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin", "manager"):
            return True
        if request.method == "DELETE":
            return False
        return obj.assigned_to_id == user.id
