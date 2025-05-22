from rest_framework import serializers
from .models import InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    inventory_total_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    inventory_total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'item_id', 'item_name', 'unit_cost', 'unit_price', 'quantity',
            'barcode', 'min_stock_level', 'max_stock_level', 'product_category',
            'status', 'last_updated', 'inventory_total_cost', 'inventory_total_value'
        ]
