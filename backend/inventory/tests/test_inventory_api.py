from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from ..models import InventoryItem
import logging
logger = logging.getLogger(__name__)

class InventoryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.item_data = {
            "item_name": "Test Item",
            "unit_cost": 10.00,
            "unit_price": 15.00,
            "quantity": 100,
            "barcode": "123456789",
            "status": "active",
            "min_stock_level": 1,
            "max_stock_level": 100,
            "product_category": "Category1"
        }

    def test_create_inventory_item(self):
        response = self.client.post(reverse('inventoryitem-list'), self.item_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['item_name'], self.item_data['item_name'])

    def test_list_inventory_items(self):
        InventoryItem.objects.create(**self.item_data)
        response = self.client.get(reverse('inventoryitem-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_inventory_item(self):
        item = InventoryItem.objects.create(**self.item_data)
        response = self.client.get(reverse('inventoryitem-detail', kwargs={'pk': item.item_id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_name'], self.item_data['item_name'])

    def test_update_inventory_item(self):
        item = InventoryItem.objects.create(**self.item_data)
        updated_data = self.item_data.copy()
        updated_data['quantity'] = 150
        response = self.client.put(reverse('inventoryitem-detail', kwargs={'pk': item.item_id}), updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quantity'], 150)

    def test_deactivate_inventory_item(self):
        item = InventoryItem.objects.create(**self.item_data)
        response = self.client.post(reverse('inventoryitem-deactivate', kwargs={'pk': item.item_id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.status, "inactive")

    def test_upload_inventory(self):
        logger.info ("upload_inventory accessed")
        csv_content = b'item_id,item_name,unit_cost,unit_price,quantity,barcode\n12345,Test Item,10.00,15.00,100,123456789\n'
        csv_file = SimpleUploadedFile("test_inventory.csv", csv_content, content_type="text/csv")
        response = self.client.post(reverse('upload_inventory'), {'file': csv_file})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('status'), 'File processed successfully')

    def test_inventory_summary(self):
        logger.info ("inventory_summary accessed")
        InventoryItem.objects.create(
            item_name="Item1",
            unit_cost=10,
            unit_price=20,
            quantity=5,
            min_stock_level=1,
            max_stock_level=100,
            product_category="Category1"
        )
        InventoryItem.objects.create(
            item_name="Item2",
            unit_cost=15,
            unit_price=30,
            quantity=10,
            min_stock_level=1,
            max_stock_level=100,
            product_category="Category2"
        )
        response = self.client.get(reverse('inventory_summary'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['total_inventory_cost'], 10 * 5 + 15 * 10)
        self.assertEqual(data['total_inventory_value'], 20 * 5 + 30 * 10)
