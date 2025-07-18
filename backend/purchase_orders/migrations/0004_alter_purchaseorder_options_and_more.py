# Generated by Django 5.1.2 on 2025-01-05 02:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase_orders', '0003_purchaseorderitem_item_desc_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='purchaseorder',
            options={'ordering': ['-order_date'], 'verbose_name': 'Purchase Order', 'verbose_name_plural': 'Purchase Orders'},
        ),
        migrations.AlterModelOptions(
            name='purchaseorderitem',
            options={'verbose_name': 'Purchase Order Item', 'verbose_name_plural': 'Purchase Order Items'},
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='total_cost',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
