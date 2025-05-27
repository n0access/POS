import os
import django
import random
from faker import Faker

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_management.settings")
django.setup()

from vendors.models import Vendor

fake = Faker()

TERMS = [choice[0] for choice in Vendor.TERMS_CHOICES]
PAYMENTS = [choice[0] for choice in Vendor.PAYMENTS_CHOICES]
STATUSES = ['Active', 'Inactive']

def create_vendor(index):
    return Vendor(
        company_name=fake.company(),
        contact_name=fake.name(),
        address_line1=fake.street_address(),
        address_line2=fake.secondary_address(),
        city=fake.city(),
        state=fake.state(),
        zip_code=fake.postcode()[:5],
        phone_number=fake.msisdn()[0:15],  # Generates a valid 15-digit string
        email=fake.email(),
        terms=random.choice(TERMS),
        payment_method=random.choice(PAYMENTS),
        website=fake.url(),
        status=random.choice(STATUSES),
        notes=fake.sentence()
    )

def run():
    for i in range(30):
        vendor = create_vendor(i)
        vendor.save()
        print(f"Created: {vendor.vendor_id} — {vendor.company_name}")

if __name__ == '__main__':
    run()
