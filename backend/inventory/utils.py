import csv
from .models import InventoryItem

def fetch_item(item_id):
    """Retrieve an inventory item by ID."""
    try:
        return InventoryItem.objects.get(id=item_id)
    except InventoryItem.DoesNotExist:
        return None

def validate_inventory_data(data):
    """Validate item data for adding or updating inventory."""
    required_fields = ['item_name', 'quantity', 'unit_cost', 'unit_price']
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Field '{field}' is required and cannot be empty."
    return True, "Validation successful."

def parse_csv(file):
    """Parse CSV file and return list of item data."""
    data = []
    reader = csv.DictReader(file.read().decode('utf-8').splitlines())
    for row in reader:
        data.append(row)
    return data


def download_inventory(request):
    # Generate CSV data here
    import csv
    from django.http import HttpResponse

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="inventory.csv"'

    writer = csv.writer(response)
    writer.writerow(['item_id', 'item_name', 'unit_cost', 'unit_price', 'quantity', 'barcode', 'status'])

    for item in InventoryItem.objects.all():
        writer.writerow([item.item_id, item.item_name, item.unit_cost, item.unit_price, item.quantity, item.barcode, item.status])

    return response