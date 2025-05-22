from django.contrib import admin
from .models import Vendor, VendorItem


# Admin configuration for the Vendor model
@admin.register (Vendor)
class VendorAdmin (admin.ModelAdmin):
    """Admin configuration for the Vendor model."""

    LIST_DISPLAY = ('company_name', 'contact_name', 'phone_number', 'email', 'city', 'state')
    SEARCH_FIELDS = ('company_name', 'contact_name', 'city', 'state')
    LIST_FILTER = ('city', 'state')

    list_display = LIST_DISPLAY
    search_fields = SEARCH_FIELDS
    list_filter = LIST_FILTER


# Admin configuration for the VendorItem model
@admin.register (VendorItem)
class VendorItemAdmin (admin.ModelAdmin):
    """Admin configuration for the VendorItem model."""

    LIST_DISPLAY = (
        'vendor',
        'item',
        'cost_price',
        'last_purchased_date',
        'purchase_order_number',
        'date_placed',
        'date_received'
    )
    SEARCH_FIELDS = ('vendor__company_name', 'item__item_name', 'purchase_order_number')
    LIST_FILTER = ('vendor', 'item', 'date_placed', 'date_received')

    list_display = LIST_DISPLAY
    search_fields = SEARCH_FIELDS
    list_filter = LIST_FILTER

