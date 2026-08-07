from django.contrib import admin

from .models import Customer, Feedback, InventoryItem, Order, Task

admin.site.register(Customer)
admin.site.register(InventoryItem)
admin.site.register(Order)
admin.site.register(Feedback)
admin.site.register(Task)
