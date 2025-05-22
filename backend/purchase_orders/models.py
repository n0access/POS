from datetime import date, datetime
from django.db import models
from django.db.models import Sum, F
from django.db import transaction
from rest_framework.exceptions import ValidationError
from vendors.models import Vendor
from inventory.models import InventoryItem, Batch
from django.contrib.auth.models import User  # Import User model

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('APPROVED','Approved'),
        ('SUBMITTED', 'Submitted'),
        ('RECEIVED', 'Received'),
        ('CLOSED','Closed'),
        ('CANCELLED', 'Cancelled'),

    ]
    STATUS_CLASSES = {
        'DRAFT': 'bg-secondary',  # Gray background for draft
        'APPROVED': 'bg-info',  # Blue background for approved
        'SUBMITTED': 'bg-primary',  # Dark blue background for submitted
        'RECEIVED': 'bg-success',  # Green background for received
        'CLOSED': 'bg-dark',  # Dark gray/black background for closed
        'CANCELLED': 'bg-danger',  # Red background for cancelled
    }

    purchase_order_id = models.CharField(max_length=20, unique=True, editable=False, primary_key=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='purchase_orders')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    order_date = models.DateField(editable=True)
    expected_date = models.DateField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)
    terms = models.TextField(max_length=225, blank=True)
    payment_method = models.TextField(max_length=225, blank=True)
    items_count = models.IntegerField(default = 0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(null=True, blank=True)
    last_updated = models.DateTimeField (auto_now = True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='updated_purchase_orders',
                                   null = True,  # Temporarily allow null values
                                   blank = True  # Optional: allow blank in forms
                                   )  # New field
    created_at = models.DateTimeField(auto_now = True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_purchase_orders',
                                   null = True,  # Temporarily allow null values
                                   blank = True  # Optional: allow blank in forms
                                   )  # New field

    def delete (self, *args, **kwargs):
        if self.status == 'RECEIVED':
            raise ValidationError ("You cannot delete a Purchase Order with status 'RECEIVED'.")
        super ( ).delete (*args, **kwargs)

    def get_status_class (self):
        return self.STATUS_CLASSES.get (self.status, 'bg-secondary')

    @property
    def calculated_total_cost(self):
        print (f"Calculating total cost for PO: {self.purchase_order_id}")
        return sum(item.quantity * item.unit_cost for item in self.items.all())

    @property
    def total_quantity(self):
        print (f"Calculating total count for PO: {self.purchase_order_id}")
        return sum(item.quantity for item in self.items.all())

    @property
    def is_overdue(self):
        return self.status == 'PLACED' and self.expected_date and self.expected_date < date.today()


    def clean (self):
        if isinstance (self.received_date, str):
            self.received_date = datetime.strptime (self.received_date, '%Y-%m-%d').date ( )  # Convert to date object

        if self.received_date and self.received_date < self.order_date:
            raise ValidationError ("Received date cannot be earlier than the order date.")

        if self.expected_date and self.expected_date < self.order_date:
            raise ValidationError ("Expected date cannot be earlier than the order date.")

    def save (self, *args, **kwargs):
        self.clean ( )  # Validate dates
        self.items_count = self.total_quantity  # Update total quantity
        self.total_cost = self.calculated_total_cost  # Update total cost
        if not self.purchase_order_id:
            with transaction.atomic ( ):
                last_po = PurchaseOrder.objects.select_for_update ( ).order_by ('purchase_order_id').last ( )
                if last_po:
                    last_id = int (last_po.purchase_order_id.split ('-') [ -1 ])
                    self.purchase_order_id = f"PO-{last_id + 1:04d}"
                else:
                    self.purchase_order_id = "PO-0001"
        super ( ).save (*args, **kwargs)

    def __str__(self):
        return f"{self.purchase_order_id} - {self.vendor.company_name}"

    class Meta:
        ordering = ['-order_date']
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    item_desc = models.TextField(max_length=255, blank=True)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    expiration_date = models.DateField (blank = True, null = True, help_text = "Expiration date for this batch.")

    def save (self, *args, **kwargs):
        super ( ).save (*args, **kwargs)


    def fetch_unit_cost(self, vendor):
        recent_order = PurchaseOrderItem.objects.filter(
            purchase_order__vendor=vendor,
            item=self.item
        ).order_by('-purchase_order__order_date').first()
        return recent_order.unit_cost if recent_order else self.item.unit_cost

    def __str__(self):
        return f"{self.item.item_name} ({self.quantity})"

    class Meta:
        verbose_name = "Purchase Order Item"
        verbose_name_plural = "Purchase Order Items"


class ReceivingLog(models.Model):
    po_item = models.ForeignKey(PurchaseOrderItem, on_delete=models.CASCADE, related_name='receiving_logs')
    received_quantity = models.PositiveIntegerField()
    date_received = models.DateTimeField(auto_now_add=True)
    expiration_date = models.DateField(null = True, blank = True)
    is_accepted = models.BooleanField (default = True)
    rejection_reason = models.CharField(max_length=255, choices=[
        ('EXPIRED', 'Expired'),
        ('SHORT_DATE', 'Short Date'),
        ('DAMAGED', 'Damaged'),
        ('LATE_DELIVERY','Late Delivery'),
        ('OTHER','Other'),
        ('ACCEPTED','Accepted')
    ])

    def __str__(self):
        status = "Accepted" if self.is_accepted else "Rejected"
        return f"{self.po_item.item.item_name} - {status}"

    class Meta:
        verbose_name = "Receiving Log"
        verbose_name_plural = "Receiving Logs"