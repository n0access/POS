# Generated by Django 5.1.2 on 2025-01-04 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase_orders', '0002_purchaseorder_payment_method_purchaseorder_terms_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorderitem',
            name='item_desc',
            field=models.TextField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='purchaseorder',
            name='order_date',
            field=models.DateField(),
        ),
    ]
