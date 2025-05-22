from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem
from vendors.models import Vendor  # Assuming you have a Vendor model

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'company_name', 'contact_name', 'contact_number']  # Adjust based on your Vendor model

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'item', 'quantity', 'unit_cost', 'line_total']

    def get_line_total(self, obj):
        return obj.quantity * obj.unit_cost if obj.quantity and obj.unit_cost else 0

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'purchase_order_id', 'vendor', 'vendor_details', 'status', 'order_date', 'expected_date', 'notes', 'total_cost', 'total_quantity', 'items']
