from django.contrib import admin
from django.db.models import Sum, F
from django.utils.html import format_html
from django.utils.formats import localize
from .models import PurchaseOrder, PurchaseOrderItem, ReceivingLog

# Currency formatting function
def format_currency(amount):
    return f"${amount:,.2f}"

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    fields = ('item', 'item_desc', 'quantity', 'unit_cost', 'line_total')
    readonly_fields = ('line_total',)

    def line_total(self, obj):
        """Dynamically calculate line total."""
        if obj.quantity and obj.unit_cost:
            return obj.quantity * obj.unit_cost
        return 0
    line_total.short_description = 'Line Total'


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = (
        'purchase_order_id',
        'vendor',
        'status',
        'order_date',
        'expected_date',
        'received_date',
        'quantity_ordered',
        'quantity_received',
        'rejected_count',
        'estimated_cost',
        'actual_cost',
    )
    list_display_links = ('purchase_order_id',)  # Make PO number clickable
    readonly_fields = ('total_quantity', 'total_cost')
    list_filter = ('status', 'vendor')
    search_fields = ('purchase_order_id', 'vendor__company_name')
    inlines = [PurchaseOrderItemInline]

    def quantity_ordered(self, obj):
        """Calculate total quantity ordered for the PO."""
        return obj.items.aggregate(Sum('quantity'))['quantity__sum'] or 0
    quantity_ordered.short_description = 'Quantity Ordered'

    def quantity_received(self, obj):
        """Calculate total quantity received for the PO."""
        return ReceivingLog.objects.filter(po_item__purchase_order=obj).aggregate(Sum('received_quantity'))['received_quantity__sum'] or 0
    quantity_received.short_description = 'Quantity Received'

    def rejected_count(self, obj):
        """Count the number of rejected items for the PO."""
        return ReceivingLog.objects.filter(po_item__purchase_order=obj, is_accepted=False).count()
    rejected_count.short_description = 'Rejected Count'

    def estimated_cost(self, obj):
        """Calculate the estimated total cost in dollar format."""
        total_cost = obj.items.aggregate(total_cost=Sum(F('quantity') * F('unit_cost')))['total_cost'] or 0
        return format_html('<b>{}</b>', format_currency(total_cost))
    estimated_cost.short_description = 'Estimated Cost'

    def actual_cost(self, obj):
        """Calculate the actual total cost in dollar format."""
        total_cost = ReceivingLog.objects.filter(po_item__purchase_order=obj).aggregate(
            total_cost=Sum(F('received_quantity') * F('po_item__unit_cost'))
        )['total_cost'] or 0
        return format_html('<b>{}</b>', format_currency(total_cost))
    actual_cost.short_description = 'Actual Cost'

    def get_queryset(self, request):
        """Optimize queryset by prefetching related data."""
        qs = super().get_queryset(request)
        return qs.prefetch_related('items', 'items__receiving_logs')


# Customize the ReceivingLog display
class ReceivingLogAdmin(admin.ModelAdmin):
    list_display = ('po_item', 'received_quantity', 'expiration_date', 'is_accepted', 'rejection_reason', 'date_received')
    list_filter = ('is_accepted', 'po_item__purchase_order__vendor', 'date_received')
    search_fields = ('po_item__item__item_name', 'po_item__purchase_order__purchase_order_id')
    date_hierarchy = 'date_received'

admin.site.register(ReceivingLog, ReceivingLogAdmin)
