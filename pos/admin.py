from django.contrib import admin
from .models import Product, Customer, Sale, SaleItem, InventoryLog, UserAudit

admin.site.register(Product)
admin.site.register(Customer)
admin.site.register(Sale)
admin.site.register(SaleItem)
admin.site.register(InventoryLog)
admin.site.register(UserAudit)
from django.contrib import admin

# Register your models here.
