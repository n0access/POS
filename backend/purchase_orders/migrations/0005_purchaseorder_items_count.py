# Generated by Django 5.1.2 on 2025-01-06 03:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase_orders', '0004_alter_purchaseorder_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='items_count',
            field=models.IntegerField(default=0, max_length=10),
        ),
    ]
