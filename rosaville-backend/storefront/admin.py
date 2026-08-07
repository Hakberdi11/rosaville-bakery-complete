from django.contrib import admin

from .models import ContactRequest, CustomCakeOrder, NewsletterSubscriber, SiteContent, TeamMember

admin.site.register(ContactRequest)
admin.site.register(CustomCakeOrder)
admin.site.register(TeamMember)
admin.site.register(NewsletterSubscriber)
admin.site.register(SiteContent)
