from django.db import models
from inventory.models import InventoryItem
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import re
from django.core.validators import URLValidator
from django.utils.safestring import mark_safe



class Vendor(models.Model):
    """
    Represents a vendor in the system.

    This class is designed to store all relevant details about a vendor,
    including contact information, payment terms, and internal status.

    :ivar vendor_id: Sequential Vendor ID
    :ivar company_name: The name of the vendor's company.
    :ivar contact_name: The name of the primary contact person at the vendor's company.
    :ivar address_line1: The first line of the vendor's address.
    :ivar address_line2: The second line of the vendor's address.
    :ivar city: The city where the vendor is located.
    :ivar state: The state where the vendor is located.
    :ivar zip_code: The zip code for the vendor's location.
    :ivar phone_number: The phone number for contacting the vendor.
    :ivar email: The email address for contacting the vendor.
    :ivar terms: The payment terms for the vendor. Options defined in TERMS_CHOICES.
    :ivar payment_method: The preferred method of payment for this vendor. Options defined in PAYMENTS_CHOICES.
    :ivar website: The vendor's website.
    :ivar status: The current status of the vendor (e.g., Active or Inactive).
    :ivar notes: Additional notes or comments about the vendor.
    :ivar purchase_orders: The related purchase orders for this vendor.
    """
    # Terms field with predefined options
    TERMS_CHOICES = [
        ('NET7', 'Net 7 (Payment due in 7 days)'),
        ('NET14', 'Net 14 (Payment due in 14 days)'),
        ('NET30', 'Net 30 (Payment due in 30 days)'),
        ('NET45', 'Net 45 (Payment due in 30 days)'),
        ('NET60', 'Net 60 (Payment due in 60 days)'),
        ('NET90', 'Net 90 (Payment due in 90 days)'),
        ('COD', 'Cash on Delivery'),
        ('PREPAID', 'Prepaid (Payment in advance)'),
        ('OTHER', 'Other (Specify in Notes)'),
    ]

    # payment methods
    PAYMENTS_CHOICES = [
        ('CASH', 'Cash'),
        ('CREDIT', 'Credit Card'),
        ('CHECK', 'Check'),
        ('BANK', 'Bank Transfer'),
        ('OTHER', 'Other (Specify in Notes)')
    ]
    vendor_id = models.CharField(max_length=10, unique=True, editable=False,primary_key = True)  # Sequential Vendor ID
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255, null=True, blank=True)
    address_line1 = models.CharField(max_length=255, blank = True, null = True)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    phone_number = models.CharField (
        max_length = 15,
        blank = True,
        null = True,
        validators = [
            RegexValidator (
                regex = r'^\+?1?\d{9,15}$',
                message = "Phone number must be entered in the format: '+123456789'. Up to 15 digits allowed."
            )
        ]
    )
    email = models.EmailField(null=True, blank=True)
    terms = models.CharField (
        max_length = 20,
        choices = TERMS_CHOICES,
        default = 'NET30',
        help_text = "Select the payment terms for this vendor"
    )

    payment_method = models.CharField (
        max_length = 10,
        choices = PAYMENTS_CHOICES,
        default = 'CHECK',
        help_text = "Select the payment method for this vendor"
    )
    website = models.URLField(null=True, blank=True)
    status = models.CharField (
        max_length = 50,
        choices = [ ('Active', 'Active'), ('Inactive', 'Inactive') ],
        default = 'Active',
        help_text = "Current status of the item."
    )
    notes = models.TextField(null=True, blank=True)

    @property
    def full_address (self):
        # Concatenate the fields with separators, skipping empty or None values
        address_parts = [
            self.address_line1,
            self.address_line2,
            self.city,
            self.state,
            self.zip_code
        ]
        # Filter out None or empty fields and join them with a comma
        return ', '.join (filter (None, address_parts))
    def __str__(self):
        return f"{self.company_name} ({self.vendor_id})"

    def clean (self):
        super ( ).clean ( )
        if self.website and not self.website.startswith (('http://', 'https://')):
            self.website = f"http://{self.website}"


    def clean (self):
        # Validate zip code format (e.g., US zip code)
        if self.zip_code and not re.match (r'^\d{5}(-\d{4})?$', self.zip_code):
            raise ValidationError ({"zip_code": "Invalid zip code format. Use 12345 or 12345-6789."})

        # Ensure address_line1, city, state are not empty (if required)
        if not self.address_line1:
            raise ValidationError ({"address_line1": "Address line 1 is required."})
        if not self.city:
            raise ValidationError ({"city": "City is required."})
        if not self.state:
            raise ValidationError ({"state": "State is required."})

    def save (self, *args, **kwargs):
        self.full_clean ( )  # Ensure clean() is called before saving
        if not self.vendor_id:  # Check if the vendor_id is already assigned
            last_vendor = Vendor.objects.all().order_by('vendor_id').last()
            if last_vendor:
                last_id = int(last_vendor.vendor_id.split('-')[-1])  # Extract the numeric part
                self.vendor_id = f"VEN-{last_id + 1:04d}"  # Increment and format as VEN-0001
            else:
                self.vendor_id = "VEN-0001"  # First vendor
        super().save(*args, **kwargs)

class VendorItem (models.Model):
    """
    Represents an item provided by a vendor in the inventory management system.

    This class links inventory items to their respective vendors and tracks various
    purchase details such as cost, order dates, and purchase order numbers.

    :ivar vendor: The vendor supplying the item.
    :type vendor: ForeignKey(Vendor, on_delete=PROTECT)
    :ivar item: The inventory item supplied by the vendor.
    :type item: ForeignKey(InventoryItem, on_delete=PROTECT)
    :ivar cost_price: The cost of the item from the vendor.
    :ivar last_purchased_date: The date on which the item was last purchased.
    :ivar purchase_order_number: The purchase order number associated with the item.
    :ivar date_placed: The date when the purchase order was placed.
    :ivar date_received: The date on which the item was received.
    """
    vendor = models.ForeignKey (Vendor, on_delete = models.PROTECT, verbose_name = "Vendor")  # Links to the Vendor
    item = models.ForeignKey (InventoryItem, on_delete = models.PROTECT,
                              verbose_name = "Item")  # Links to the Inventory Item
    cost_price = models.DecimalField (max_digits = 10, decimal_places = 2,
                                      verbose_name = "Cost Price")  # Cost of the item from this vendor
    last_purchased_date = models.DateField (blank = True, null = True, verbose_name = "Last Purchased Date")
    # Purchase order-related fields
    purchase_order_number = models.CharField (max_length = 50, blank = True, null = True,
                                              verbose_name = "Purchase Order Number")  # To be linked with purchase orders
    date_placed = models.DateField (blank = True, null = True,
                                    verbose_name = "Date Placed")  # Date when the order was placed
    date_received = models.DateField (blank = True, null = True,
                                      verbose_name = "Date Received")  # Date when the order was received

    def __str__ (self):
        return f"{self.item.item_name} from {self.vendor.company_name}"
