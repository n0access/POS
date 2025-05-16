from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    expiration_date = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)
    category = models.CharField(max_length=100)  # New field

    def __str__(self):
        return self.name

class Customer(models.Model):
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=100, null=True, blank=True)  # made nullable to avoid migration issues
    email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.name

class Sale(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Sale {self.id} - {self.date}"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)  # nullable here
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.quantity} x {self.product} in {self.sale}"

# Optional audit log example
class InventoryLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    change = models.IntegerField()  # positive or negative stock change
    date = models.DateTimeField(auto_now_add=True)
    user = models.CharField(max_length=200, null=True, blank=True)  # or link to auth.User if you want

    def __str__(self):
        return f"{self.change} units for {self.product}"
class UserAudit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"
