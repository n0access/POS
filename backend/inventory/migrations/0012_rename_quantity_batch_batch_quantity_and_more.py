# Generated by Django 5.1.2 on 2025-01-12 03:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0011_remove_batch_unit_cost_batch_batch_unit_cost_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='batch',
            old_name='quantity',
            new_name='batch_quantity',
        ),
        migrations.AddField(
            model_name='inventoryitem',
            name='quantity',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Quantity for this batch.', max_digits=10),
        ),
    ]
