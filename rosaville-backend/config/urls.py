from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from catalog.views import UploadFileView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/upload/", UploadFileView.as_view(), name="upload"),
    path("api/", include("accounts.urls")),
    path("api/", include("catalog.urls")),
    path("api/", include("operations.urls")),
    path("api/", include("storefront.urls")),
    path("api/", include("integrations.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
