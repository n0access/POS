from dateutil.utils import today
from datetime import timedelta
from django.core.validators import MinValueValidator
from django.db import models

# Category choices
category_choices = [
    ('BAKERY', 'Bakery'),
    ('BEVERAGE', 'Beverage'),
    ('CANDY', 'Candy'),
    ('CHANGEMAKER', 'Changemaker'),
    ('CHOCOLATE', 'Chocolate'),
    ('DELI COLD', 'Deli Cold'),
    ('DELI GENERAL', 'Deli General'),
    ('DELI SUPPLY', 'Deli Supply'),
    ('FOOD', 'Food'),
    ('GROCERY', 'Grocery'),
    ('GUM & MINT', 'Gum & Mint'),
    ('HBA', 'Hba'),
    ('IMPORT', 'Import'),
    ('NON CHOCOLATE', 'Non Chocolate'),
    ('ORGANIC', 'Organic'),
    ('PAPER GOODS', 'Paper Goods'),
    ('PEG BAG', 'Peg Bag'),
    ('PET FOOD', 'Pet Food'),
    ('ROLLING PAPER', 'Rolling Paper'),
    ('SNACKS', 'Snacks'),
    ('SYSTEM', 'System'),
    ('THEATER', 'Theater'),
    ('TOY', 'Toy'),
    ('WIRELESS', 'Wireless')
]

class InventoryItem(models.Model):
    """
    Represents an item in the inventory with properties to track cost, stock levels, and status.
    """
    MEASUREMENT_TYPES = [
        ('count', 'Count-based'),  # Whole numbers
        ('weight', 'Weight-based'),  # Fractions allowed
    ]

    item_id = models.BigAutoField(primary_key=True, help_text="Unique sequential numeric identifier for the inventory item.")
    item_name = models.CharField(max_length=255, help_text="Name of the inventory item.")
    unit_price =  models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Fixed selling price per unit, independent of batches."
    )
    unit_cost = models.DecimalField (max_digits = 10, decimal_places = 2, default = 0.00,
                                     help_text = "Standard cost per unit.")
    quantity = models.DecimalField (
        max_digits = 10,
        decimal_places = 2,
        default = 0,
        help_text = "Quantity for this batch."
    )

    barcode = models.CharField(max_length=255, blank=True, null=True, help_text="Optional barcode identifier.")
    min_stock_level = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        help_text="Minimum stock level threshold. Allows fractions for weight-based items.",
        validators=[MinValueValidator(0.00)]
    )
    max_stock_level = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=100,
        help_text="Maximum stock level threshold. Allows fractions for weight-based items.",
        validators=[MinValueValidator(0.00)]
    )
    product_category = models.CharField(
        max_length=100,
        choices=category_choices,
        default="SYSTEM",
        help_text="Category of the product."
    )
    status = models.CharField(
        max_length=50,
        choices=[('Active', 'Active'), ('Inactive', 'Inactive')],
        default='Active',
        help_text="Current status of the item."
    )
    measurement_type = models.CharField(
        max_length=10,
        choices=MEASUREMENT_TYPES,
        default='count',
        help_text="Indicates whether the item is count-based or weight-based."
    )
    has_issues = models.BooleanField(default=False, help_text="Indicates if the item has issues needing review.")
    issue_reasons = models.TextField(blank=True, null=True, help_text="Reasons for flagging this item as having issues.")
    last_updated = models.DateTimeField(auto_now=True, help_text="Timestamp of the last update.")

    class Meta:
        ordering = ['item_name']
        verbose_name = "Inventory Item"
        verbose_name_plural = "Inventory Items"

    def save(self, *args, **kwargs):
        # Convert specific fields to uppercase before saving
        self.item_name = self.item_name.upper()
        self.product_category = self.product_category.upper()
        self.status = self.status.upper()

        # Flag rows with issues
        issues = []

        # Check for potential issues
        if self.min_stock_level > self.max_stock_level:
            issues.append("Minimum stock level is greater than maximum stock level.")

        if self.min_stock_level < 0 or self.max_stock_level < 0:
            issues.append("Stock levels cannot be negative.")

        # Set has_issues flag based on detected issues
        self.has_issues = len(issues) > 0

        # Optionally log issues for later use
        self.issue_reasons = "; ".join(issues) if issues else None
        super().save(*args, **kwargs)



    def __str__(self):
        return f"{self.item_name} (ID: {self.item_id}, {self.measurement_type.capitalize()}-based)"



class Batch(models.Model):
    """
    Represents a batch of inventory for a specific item, tracking quantity and expiration date.
    """
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="batches")
    batch_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Quantity for this batch."
    )
    expiration_date = models.DateField(blank=True, null=True, help_text="Expiration date for this batch.")
    batch_unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Cost per unit for this batch."
    )

    class Meta:
        ordering = ['expiration_date']

    def save(self, *args, **kwargs):

        if self.expiration_date and self.expiration_date < today().date():
            raise ValueError("Expiration date cannot be in the past.")

        super().save(*args, **kwargs)

    def __str__(self):
        return (f"Batch of {self.inventory_item.item_name}(Unit Cost:{self.batch_unit_cost}) "
                f"(Expires: {self.expiration_date}, Quantity: {self.batch_quantity})")
