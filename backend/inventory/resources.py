from import_export import resources
from .models import InventoryItem

class InventoryItemResource(resources.ModelResource):
    class Meta:
        model = InventoryItem
        import_id_fields = ['item_id']
        fields = ('item_id', 'item_name', 'unit_cost', 'unit_price', 'quantity',
                  'barcode', 'min_stock_level', 'max_stock_level', 'product_category', 'status')
