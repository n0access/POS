from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum, F
from .models import PurchaseOrder, PurchaseOrderItem
from inventory.models import InventoryItem, Batch

@receiver(post_save, sender=PurchaseOrderItem)
def update_purchase_order_total_cost_on_save(sender, instance, **kwargs):
    """
    Recalculate total cost and total quantity when a PurchaseOrderItem is saved.
    """
    purchase_order = instance.purchase_order
    purchase_order.items_count = purchase_order.total_quantity
    purchase_order.total_cost = purchase_order.calculated_total_cost
    purchase_order.save()
    print("Signals for Purchase Orders loaded (on save).")


@receiver(post_delete, sender=PurchaseOrderItem)
def update_purchase_order_total_cost_on_delete(sender, instance, **kwargs):
    """
    Recalculate total cost and total quantity when a PurchaseOrderItem is deleted.
    """
    purchase_order = instance.purchase_order
    purchase_order.items_count = purchase_order.total_quantity
    purchase_order.total_cost = purchase_order.calculated_total_cost
    purchase_order.save()
    print("Signals for Purchase Orders loaded (on delete).")


@receiver(post_save, sender=PurchaseOrder)
def update_inventory_on_received(sender, instance, **kwargs):
    """
    Updates the inventory when a Purchase Order is marked as RECEIVED.
    """
    if instance.status == 'RECEIVED':
        inventory_items_to_update = []

        for po_item in instance.items.all():
            inventory_item = po_item.item  # Get the related inventory item
            received_quantity = po_item.quantity  # Quantity from the PO item

            # Create a new batch
            Batch.objects.create(
                inventory_item=inventory_item,
                batch_quantity=received_quantity,
                batch_unit_cost=po_item.unit_cost,  # Use unit cost from the PO item
                expiration_date=po_item.expiration_date,
            )

            # Recalculate average unit cost for the InventoryItem
            avg_unit_cost = Batch.objects.filter(inventory_item=inventory_item).aggregate(
                avg_unit_cost=Sum(F('batch_unit_cost') * F('batch_quantity')) / Sum('batch_ quantity')
            )['avg_unit_cost']

            # Update InventoryItem with new average unit cost and total quantity
           # inventory_item.unit_cost = avg_unit_cost
            inventory_item.quantity = Batch.objects.filter(inventory_item=inventory_item).aggregate(
                total_quantity=Sum('batch_quantity')
            )['total_quantity']

            inventory_items_to_update.append(inventory_item)

        # Bulk update all inventory items
       # InventoryItem.objects.bulk_update(inventory_items_to_update, ['unit_cost', 'quantity'])
        print("Signals for InventoryItem and Batches loaded.")
