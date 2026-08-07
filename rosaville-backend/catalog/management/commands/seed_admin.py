import os

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from catalog.models import Dessert, SpecialOfMonth
from storefront.models import SiteContent

User = get_user_model()

PLACEHOLDER_DESSERTS = [
    {"name": "Chocolate Decadence", "category": "cakes", "price": "4.50", "display_order": 1,
     "description": "Rich dark chocolate cake with silky ganache."},
    {"name": "Vanilla Dream", "category": "cakes", "price": "3.99", "display_order": 2,
     "description": "Classic vanilla cake with buttercream frosting."},
    {"name": "Strawberry Bliss", "category": "cakes", "price": "4.99", "display_order": 3,
     "description": "Fresh strawberry cake with whipped cream."},
    {"name": "Croissant", "category": "pastries", "price": "3.50", "display_order": 4,
     "description": "Buttery, flaky French croissant."},
    {"name": "Classic Cheesecake", "category": "cheesecakes", "price": "5.99", "display_order": 5,
     "description": "Creamy New York style cheesecake."},
]

DEFAULT_BUSINESS_HOURS = [
    {"day": "Monday - Friday", "hours": "9:00 AM - 7:00 PM"},
    {"day": "Saturday", "hours": "10:00 AM - 8:00 PM"},
    {"day": "Sunday", "hours": "11:00 AM - 6:00 PM"},
    {"day": "Holidays", "hours": "Call for hours"},
]


def _placeholder_png_bytes():
    from PIL import Image
    import io

    img = Image.new("RGB", (600, 400), color=(201, 148, 155))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


class Command(BaseCommand):
    help = "Seed the first admin user, placeholder desserts, and default site content for local dev."

    def handle(self, *args, **options):
        email = os.environ.get("ADMIN_SEED_EMAIL", "admin@rosaville.local")
        password = os.environ.get("ADMIN_SEED_PASSWORD", "changeme123")

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password, full_name="Admin")
            self.stdout.write(self.style.SUCCESS(f"Created admin user {email}"))
        else:
            self.stdout.write(f"Admin user {email} already exists, skipping")

        if not Dessert.objects.exists():
            base_url = os.environ.get("BACKEND_BASE_URL", "http://localhost:8000")
            placeholder_bytes = _placeholder_png_bytes()
            for data in PLACEHOLDER_DESSERTS:
                key = f"desserts/{data['name'].lower().replace(' ', '-')}.png"
                saved_path = default_storage.save(key, ContentFile(placeholder_bytes))
                image_url = f"{base_url}{default_storage.url(saved_path)}"
                Dessert.objects.create(**data, featured_image=image_url)
            self.stdout.write(self.style.SUCCESS(f"Seeded {len(PLACEHOLDER_DESSERTS)} placeholder desserts"))
        else:
            self.stdout.write("Desserts already seeded, skipping")

        content = SiteContent.load()
        if not content.contact_email:
            content.contact_email = "hello@rosaville.com"
            content.contact_phone = "(555) 123-4567"
            content.contact_address = "123 Sweet Street, Dessert City, DC 12345"
            content.business_hours = DEFAULT_BUSINESS_HOURS
            content.save()
            self.stdout.write(self.style.SUCCESS("Seeded default site content"))
        else:
            self.stdout.write("Site content already set, skipping")

        if not SpecialOfMonth.objects.exists() and Dessert.objects.exists():
            dessert = Dessert.objects.first()
            SpecialOfMonth.objects.create(
                dessert=dessert,
                month_label="This Month",
                is_active=True,
            )
            self.stdout.write(self.style.SUCCESS(f"Seeded initial special of the month: {dessert.name}"))
