from django.contrib import admin
from .models import InventoryItem, Batch

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = (
        'item_id', 'item_name', 'product_category', 'unit_price', 'unit_cost',
        'quantity', 'min_stock_level', 'max_stock_level', 'status', 'last_updated'
    )
    list_filter = ('product_category', 'status',)
    search_fields = ('item_name', 'barcode',)
    readonly_fields = ('last_updated',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('item_name', 'barcode', 'product_category', 'measurement_type', 'status')
        }),
        ('Pricing & Stock Levels', {
            'fields': ('unit_price', 'unit_cost', 'quantity', 'min_stock_level', 'max_stock_level')
        }),
        ('Additional Info', {
            'fields': ('has_issues', 'issue_reasons', 'last_updated')
        }),
    )

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = (
        'inventory_item', 'batch_quantity', 'batch_unit_cost', 'expiration_date'
    )
    list_filter = ('expiration_date',)
    search_fields = ('inventory_item__item_name',)
    fieldsets = (
        ('Batch Details', {
            'fields': ('inventory_item', 'batch_quantity', 'batch_unit_cost', 'expiration_date')
        }),
    )
