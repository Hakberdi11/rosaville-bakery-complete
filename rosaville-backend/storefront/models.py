from django.db import models


def _default_home_why_choose_items():
    return [
        {"title": "Premium Ingredients", "description": "Only the finest, freshest ingredients sourced from trusted suppliers."},
        {"title": "Handcrafted Quality", "description": "Every dessert is made by hand with care and attention to detail."},
        {"title": "Custom Creations", "description": "Your vision, our expertise. We create personalized desserts for your special moments."},
        {"title": "Family Recipe", "description": "Generations of baking excellence passed down through our family."},
    ]


def _default_about_values_items():
    return [
        {"title": "Homemade Quality", "description": "Every dessert is handcrafted with the same care you would put into your own kitchen."},
        {"title": "Fresh Ingredients", "description": "We source the finest, freshest ingredients to ensure every bite is exceptional."},
        {"title": "Family Atmosphere", "description": "Our café is a warm, welcoming space where everyone feels like family."},
        {"title": "Attention to Detail", "description": "From presentation to flavor, every element is thoughtfully considered."},
        {"title": "Customization", "description": "Your dessert, your way. We love creating personalized creations for your special moments."},
        {"title": "Hospitality", "description": "We treat every customer like a cherished guest in our home."},
    ]


class ContactRequest(models.Model):
    """Unifies Base44's `ContactRequest` entity and front-last's old `contactMessages` table."""

    class Status(models.TextChoices):
        NEW = "New", "New"
        OPEN = "Open", "Open"
        ASSIGNED = "Assigned", "Assigned"
        RESOLVED = "Resolved", "Resolved"
        CLOSED = "Closed", "Closed"

    class Source(models.TextChoices):
        WEBSITE = "Website", "Website"
        EMAIL = "Email", "Email"
        PHONE = "Phone", "Phone"
        SOCIAL = "Social", "Social"

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    assigned_to = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WEBSITE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name}: {self.subject or self.message[:40]}"


class CustomCakeOrder(models.Model):
    """Custom cake requests submitted from the public site's Custom Cakes form.
    Staff triage these on the dashboard's Custom Cake Orders page: set status,
    record a deposit, and optionally convert an accepted request into a real
    `operations.Order` once production is ready to be scheduled."""

    class Status(models.TextChoices):
        NEW = "New", "New"
        REVIEWED = "Reviewed", "Reviewed"
        QUOTED = "Quoted", "Quoted"
        CONFIRMED = "Confirmed", "Confirmed"
        IN_PRODUCTION = "In Production", "In Production"
        COMPLETED = "Completed", "Completed"
        CANCELLED = "Cancelled", "Cancelled"

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    occasion = models.CharField(max_length=255)
    cake_size = models.CharField(max_length=100)
    flavor = models.CharField(max_length=255)
    custom_requests = models.TextField(blank=True)
    preferred_date = models.DateField(null=True, blank=True)
    inspiration_image_url = models.URLField(max_length=500, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_paid = models.BooleanField(default=False)
    order = models.ForeignKey(
        "operations.Order", null=True, blank=True, on_delete=models.SET_NULL, related_name="custom_cake_requests"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.occasion})"


class TeamMember(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    image_url = models.URLField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class SiteContent(models.Model):
    """Singleton: the editable copy/branding for the public site (dashboard's
    CMS page), and the primary/accent colors it's styled with. Always pk=1 —
    use `SiteContent.load()` rather than the manager directly."""

    hero_title = models.CharField(max_length=255, default="Fresh Cakes Made to Order")
    hero_subtitle = models.TextField(
        default="Handcrafted desserts made with love and the finest ingredients."
    )
    hero_image = models.CharField(max_length=500, blank=True, default="")

    about_title = models.CharField(max_length=255, default="Our Story")
    about_text = models.TextField(
        default="Rosaville Desserts began as a small home kitchen with a big dream — "
        "to bring joy through beautifully crafted cakes."
    )

    contact_email = models.EmailField(blank=True, default="")
    contact_phone = models.CharField(max_length=20, blank=True, default="")
    contact_address = models.CharField(max_length=500, blank=True, default="")
    # [{"day": "Monday - Friday", "hours": "9:00 AM - 7:00 PM"}, ...]
    business_hours = models.JSONField(default=list, blank=True)

    instagram_url = models.URLField(blank=True, default="")
    facebook_url = models.URLField(blank=True, default="")

    primary_color = models.CharField(max_length=7, default="#C9949B")
    accent_color = models.CharField(max_length=7, default="#C97A85")
    # Core palette beyond primary/accent. cta/cta-hover (the "Add to Cart"
    # button color) is deliberately NOT owner-configurable here — see the
    # comment on those CSS vars in rosaville-front-last/client/src/index.css.
    background_color = models.CharField(max_length=7, default="#FBF7F4")
    foreground_color = models.CharField(max_length=7, default="#3D2817")
    border_color = models.CharField(max_length=7, default="#E8D4D8")
    muted_color = models.CharField(max_length=7, default="#F0D4D8")

    class HeadingFont(models.TextChoices):
        PLAYFAIR = "Playfair Display", "Playfair Display"
        CORMORANT = "Cormorant Garamond", "Cormorant Garamond"
        MERRIWEATHER = "Merriweather", "Merriweather"
        LIBRE_BASKERVILLE = "Libre Baskerville", "Libre Baskerville"
        DM_SERIF = "DM Serif Display", "DM Serif Display"
        LORA = "Lora", "Lora"

    class BodyFont(models.TextChoices):
        POPPINS = "Poppins", "Poppins"
        LATO = "Lato", "Lato"
        MONTSERRAT = "Montserrat", "Montserrat"
        NUNITO_SANS = "Nunito Sans", "Nunito Sans"
        INTER = "Inter", "Inter"
        WORK_SANS = "Work Sans", "Work Sans"

    # Curated pairs only (see CMS.jsx's Typography dropdown) — heading_font
    # and body_font are always set together from one of the FONT_PAIRS below,
    # never mixed independently, so the two choice lists just need to contain
    # the values that appear in FONT_PAIRS.
    heading_font = models.CharField(max_length=40, choices=HeadingFont.choices, default=HeadingFont.PLAYFAIR)
    body_font = models.CharField(max_length=40, choices=BodyFont.choices, default=BodyFont.POPPINS)

    site_name = models.CharField(max_length=255, default="Rosaville Desserts")

    home_why_choose_title = models.CharField(max_length=255, default="Why Choose Rosaville")
    home_why_choose_subtitle = models.CharField(
        max_length=500, default="We're committed to excellence in every bite."
    )
    # [{"title": "...", "description": "..."}, ...]
    home_why_choose_items = models.JSONField(default=_default_home_why_choose_items, blank=True)

    about_subtitle = models.CharField(
        max_length=500,
        default="A tale of passion, family recipes, and the joy of creating sweet moments.",
    )
    about_values_title = models.CharField(max_length=255, default="Our Values")
    # [{"title": "...", "description": "..."}, ...]
    about_values_items = models.JSONField(default=_default_about_values_items, blank=True)

    show_testimonials = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Site Content"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
