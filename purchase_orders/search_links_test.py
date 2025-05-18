from django.test import TestCase
from django.urls import reverse


class SearchLinksTest (TestCase):
    def test_search_vendors_url (self):
        response = self.client.get (reverse ('search_vendors'))
        # Ensure the response status is 200 (OK) or the appropriate code
        self.assertEqual (response.status_code, 200)
        # Optional: Test the content of the response (based on expected results)
        # For example:
        # self.assertIn("expected_data_or_text", response.content.decode())

    def test_search_items_url (self):
        response = self.client.get (reverse ('search_items'))
        # Ensure the response status is 200 (OK) or the appropriate code
        self.assertEqual (response.status_code, 200)
        # Optional: Test the content of the response (based on expected results)
        # self.assertIn("expected_data_or_text", response.content.decode())