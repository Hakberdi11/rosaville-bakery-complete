from django.contrib import admin

from .models import Dessert, SpecialOfMonth


@admin.register(Dessert)
class DessertAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "availability", "featured", "display_order"]
    list_filter = ["category", "availability", "featured", "seasonal"]
    search_fields = ["name", "description"]


@admin.register(SpecialOfMonth)
class SpecialOfMonthAdmin(admin.ModelAdmin):
    list_display = ["month_label", "dessert", "is_active", "created_at"]
    list_filter = ["is_active"]
