# Generated by Django 5.1.2 on 2025-01-09 01:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase_orders', '0009_receivinglog'),
    ]

    operations = [
        migrations.AlterField(
            model_name='receivinglog',
            name='rejection_reason',
            field=models.CharField(choices=[('EXPIRED', 'Expired'), ('SHORT_DATE', 'Short Date'), ('DAMAGED', 'Damaged'), ('LATE_DELIVERY', 'Late Delivery'), ('OTHER', 'Other'), ('ACCEPTED', 'Accepted')], max_length=255),
        ),
    ]
