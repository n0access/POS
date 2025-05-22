import csv
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class InventoryItemViewSet (viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all ( )
    serializer_class = InventoryItemSerializer
    authentication_classes = [ TokenAuthentication ]  # ✅ Requires Token Authentication
    permission_classes = [ IsAuthenticated ]  # 🔒 Restrict access to authenticated users
    parser_classes = [ MultiPartParser ]  # For file upload

    @action (detail = False, methods = [ 'get' ])
    def download (self, request):
        # Generate CSV response
        response = HttpResponse (content_type = 'text/csv')
        response [ 'Content-Disposition' ] = 'attachment; filename="inventory.csv"'

        writer = csv.writer (response)
        writer.writerow (
            [ 'Item ID', 'Name', 'Cost', 'Price', 'Quantity', 'Barcode', 'Min Level', 'Max Level', 'Category',
              'Status' ])

        for item in InventoryItem.objects.all ( ):
            writer.writerow ([
                item.item_id, item.item_name, item.unit_cost, item.unit_price,
                item.quantity, item.barcode, item.min_stock_level,
                item.max_stock_level, item.product_category, item.status
            ])

        return response

    @action (detail = False, methods = [ 'post' ])
    def upload (self, request):
        # Process uploaded CSV file
        file = request.FILES.get ('file')
        if not file:
            return Response ({'error': 'No file uploaded'}, status = 400)

        reader = csv.reader (file.read ( ).decode ('utf-8').splitlines ( ))
        next (reader)  # Skip header row

        for row in reader:
            # Extract each field assuming CSV order matches model fields
            item_id, item_name, unit_cost, unit_price, quantity, barcode, min_level, max_level, category, status = row
            InventoryItem.objects.update_or_create (
                item_id = item_id,
                defaults = {
                    'item_name': item_name,
                    'unit_cost': unit_cost,
                    'unit_price': unit_price,
                    'quantity': quantity,
                    'barcode': barcode,
                    'min_stock_level': min_level,
                    'max_stock_level': max_level,
                    'product_category': category,
                    'status': status,
                }
            )

        return Response ({'status': 'File processed successfully'})
