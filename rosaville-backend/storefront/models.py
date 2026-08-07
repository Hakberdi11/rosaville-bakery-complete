from django.db import models


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
