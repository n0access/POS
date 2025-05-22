from datetime import date

from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from .forms import ReceivingLogForm
from .models import PurchaseOrderItem, PurchaseOrder, ReceivingLog
from django.utils.timezone import now, timedelta


# Receiving logs

def lookup_po(request):
    if request.method == 'POST':
        po_number = request.POST.get('po_number')
        return redirect('receive_po', po_item_id=po_number)  # Redirect to the receiving page
    return render(request, 'purchase_orders/lookup_po.html')



def receiving_page(request, po_item_id):
    try:
        # Check if input is numeric-only (e.g., '0094') and prepend 'PO-' if necessary
        if po_item_id.isdigit ( ):
            po_item_id = f"PO-{po_item_id.zfill (4)}"  # Ensure proper format, e.g., 'PO-0094'

        # Perform case-insensitive lookup
        purchase_order = PurchaseOrder.objects.get (purchase_order_id__iexact = po_item_id)
    except PurchaseOrder.DoesNotExist:
        messages.error (request,
                        f"Purchase Order {po_item_id} does not exist. Please check the PO number and try again.")
        return redirect ('lookup_po')  # Redirect to the PO lookup page
    today_date = date.today()
    default_expiration_date = today_date + timedelta(days=90)  # 3 months from today

    # Prevent receiving if the PO is already marked as RECEIVED
    if purchase_order.status == 'RECEIVED':
        messages.error(request, f"PO {purchase_order.purchase_order_id} has already been received.")
        return redirect('lookup_po')

    # Warn user if PO is not submitted
    if purchase_order.status != 'SUBMITTED':
        messages.warning(request, f"PO {purchase_order.purchase_order_id} is not approved or submitted yet, but you can proceed with receiving.")

    if request.method == 'POST':
        # Process the receiving form
        for item in purchase_order.items.all():
            received_quantity = int(request.POST.get(f'received_quantity_{item.id}', 0))
            expiration_date = request.POST.get(f'expiration_date_{item.id}', default_expiration_date)
            is_accepted = request.POST.get(f'is_accepted_{item.id}', False) == 'on'
            rejection_reason = request.POST.get(f'rejection_reason_{item.id}', "Accepted")

            # Handle rejection_reason logic
            if is_accepted:
                rejection_reason = "Accepted"  # Ensure rejection reason is None if accepted

                # Save the batch only if the item is accepted
                if is_accepted and received_quantity > 0:
                    Batch.objects.create (
                        inventory_item = item.item,
                        quantity = received_quantity,
                        expiration_date = expiration_date,
                        unit_cost = item.unit_cost,  # Pull from PO item
                        unit_price = item.item.unit_price  # Use fixed unit price from InventoryItem
                    )

                    # Update the average unit cost in InventoryItem
                    item.item.unit_cost = Batch.objects.filter (inventory_item = item.item).aggregate (
                        avg_unit_cost = Sum (F ('unit_cost') * F ('quantity')) / Sum ('quantity')
                    ) [ 'avg_unit_cost' ]
                    item.item.save ( )

            # Save the receiving log
            ReceivingLog.objects.create(
                po_item=item,
                received_quantity=received_quantity if is_accepted else 0,
                expiration_date=expiration_date,
                is_accepted=is_accepted,
                rejection_reason=rejection_reason
            )

        # Change status to RECEIVED after successful submission
        purchase_order.status = 'RECEIVED'
        purchase_order.received_date = request.POST.get('received_date', today_date)
        purchase_order.save()

        messages.success(request, f"PO {purchase_order.purchase_order_id} has been successfully received.")
        return redirect('lookup_po')

    # Render the receiving page
    return render(request, 'purchase_orders/receiving_page.html', {
        'purchase_order': purchase_order,
        'today_date': today_date,
        'default_expiration_date': default_expiration_date
    })




def receiving_success(request):
    return render(request, 'purchase_orders/receiving_success.html')

def autocomplete_po(request):
    if 'term' in request.GET:
        term = request.GET.get('term')
        matching_pos = PurchaseOrder.objects.filter(purchase_order_id__icontains=term)[:10]
        results = [{'id': po.id, 'value': po.purchase_order_id} for po in matching_pos]
        return JsonResponse(results, safe=False)
    return JsonResponse([], safe=False)