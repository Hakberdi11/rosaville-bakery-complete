import io
import uuid

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import filters, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import ReadOnlyOrIsStaff

from .models import Dessert, SpecialOfMonth
from .serializers import DessertSerializer, SpecialOfMonthSerializer

HEIC_EXTENSIONS = {"heic", "heif"}


def _convert_heic_to_jpeg(file):
    """Browsers other than Safari can't render HEIC/HEIF at all, so photos
    straight off an iPhone (its default format) would upload fine but never
    display. Convert to JPEG at upload time so every browser can show it."""
    import pillow_heif
    from PIL import Image

    heif_file = pillow_heif.read_heif(file.read())
    image = Image.frombytes(heif_file.mode, heif_file.size, heif_file.data, "raw")
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=90)
    buf.seek(0)
    return ContentFile(buf.read())


class DessertViewSet(viewsets.ModelViewSet):
    queryset = Dessert.objects.all()
    serializer_class = DessertSerializer
    permission_classes = [ReadOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def get_queryset(self):
        qs = Dessert.objects.all()
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        in_gallery = self.request.query_params.get("in_gallery")
        if in_gallery is not None:
            qs = qs.filter(in_gallery=in_gallery.lower() == "true")
        return qs


class SpecialOfMonthViewSet(viewsets.ModelViewSet):
    """Dashboard manages the history here; the public site only ever needs
    `?is_active=true` to find the current one."""

    queryset = SpecialOfMonth.objects.all()
    serializer_class = SpecialOfMonthSerializer
    permission_classes = [ReadOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def get_queryset(self):
        qs = SpecialOfMonth.objects.all()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        return qs

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_active", True):
            SpecialOfMonth.objects.update(is_active=False)
        serializer.save()

    def perform_update(self, serializer):
        if serializer.validated_data.get("is_active"):
            SpecialOfMonth.objects.exclude(pk=serializer.instance.pk).update(is_active=False)
        serializer.save()


class UploadFileView(APIView):
    """Generic local-disk file upload, replacing base44.integrations.Core.UploadFile.
    Deliberately public (AllowAny), not staff-only: the dashboard uses it for
    dessert photos, but the public site also uses it for customer-submitted
    custom-cake inspiration images — same tradeoff Base44's original upload
    endpoint made (unauthenticated uploads for public-facing forms)."""

    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=400)
        ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else "bin"

        if ext in HEIC_EXTENSIONS:
            try:
                file = _convert_heic_to_jpeg(file)
                ext = "jpg"
            except Exception:
                return Response(
                    {"error": "Could not convert this HEIC image. Try exporting it as JPEG/PNG first."},
                    status=400,
                )

        key = f"uploads/{uuid.uuid4().hex}.{ext}"
        saved_path = default_storage.save(key, file)
        file_url = request.build_absolute_uri(default_storage.url(saved_path))
        return Response({"file_url": file_url})
