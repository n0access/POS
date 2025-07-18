# Generated by Django 5.1.2 on 2025-01-10 22:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inventoryitem',
            name='item_id',
            field=models.BigAutoField(help_text='Unique sequential numeric identifier for the inventory item.', primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='inventoryitem',
            name='max_stock_level',
            field=models.PositiveIntegerField(default=100, help_text='Maximum stock level threshold.'),
        ),
        migrations.AlterField(
            model_name='inventoryitem',
            name='min_stock_level',
            field=models.PositiveIntegerField(default=1, help_text='Minimum stock level threshold.'),
        ),
    ]
