from django.test import TestCase
from django.utils import timezone
from .forms import PurchaseOrderForm, PurchaseOrderItemForm
from .models import PurchaseOrder, PurchaseOrderItem
from vendors.models import Vendor
from inventory.models import InventoryItem


class PurchaseOrderFormTest (TestCase):

    def setUp (self):
        # Create sample vendor and inventory items
        self.vendor = Vendor.objects.create (name = "Sample Vendor")
        self.item = InventoryItem.objects.create (name = "Sample Item", status = "active")

    def test_form_initialization (self):
        form = PurchaseOrderForm ( )
        self.assertIn ('vendor_search', form.fields)
        self.assertEqual (form.fields [ 'expected_date' ].initial,
                          timezone.now ( ).date ( ) + timezone.timedelta (days = 1))

    def test_form_valid_data (self):
        form_data = {
            'vendor': self.vendor.id,
            'expected_date': timezone.now ( ).date ( ),
            'notes': 'Some notes here',
        }
        form = PurchaseOrderForm (data = form_data)
        self.assertTrue (form.is_valid ( ))

    def test_form_invalid_data (self):
        form_data = {
            'vendor': '',
            'expected_date': '',
            'notes': 'Some notes here',
        }
        form = PurchaseOrderForm (data = form_data)
        self.assertFalse (form.is_valid ( ))


class PurchaseOrderItemFormTest (TestCase):

    def setUp (self):
        # Create sample items
        self.item = InventoryItem.objects.create (name = "Sample Item", status = "active")

    def test_item_form_initialization (self):
        form = PurchaseOrderItemForm (vendor = self.item.id)
        self.assertIn ('item_search', form.fields)

    def test_item_form_valid_data (self):
        form_data = {
            'item': self.item.id,
            'quantity': 10,
            'unit_cost': 50.00,
        }
        form = PurchaseOrderItemForm (data = form_data)
        self.assertTrue (form.is_valid ( ))

    def test_item_form_invalid_data (self):
        form_data = {
            'item': self.item.id,
            'quantity': 10,
            'unit_cost': -1,
        }
        form = PurchaseOrderItemForm (data = form_data)
        self.assertFalse (form.is_valid ( ))
        self.assertIn ('unit_cost', form.errors)

from django.test import Client


class TestAJAXSearch (TestCase):
    def setUp (self):
        self.client = Client ( )
        # Create test data

    def test_vendor_search (self):
        response = self.client.get ('/api/vendors/search/?q=Sample')
        self.assertEqual (response.status_code, 200)
        # Add assertions for JSON response content checking

    def test_item_search (self):
        response = self.client.get ('/api/items/search/?q=Sample Item')
        self.assertEqual (response.status_code, 200)
        # Add assertions for JSON response content checking
