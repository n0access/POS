from datetime import date, timedelta
from django.utils.timezone import now
from django.urls import reverse
from django.http import FileResponse, HttpResponse
from django.utils.html import escape
from django.core.paginator import Paginator
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django_datatables_view.base_datatable_view import BaseDatatableView
from django.db.models import Q
from django.contrib import messages
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PurchaseOrder, PurchaseOrderItem, ReceivingLog
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer
from vendors.models import Vendor
from vendors.serializers import VendorSerializer
from .forms import PurchaseOrderForm, PurchaseOrderItemFormSet
from .pdf_utils import generate_purchase_order_pdf
import tempfile
import logging



logger = logging.getLogger(__name__)  # Setup logging



# P.O. create form
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse
from .forms import PurchaseOrderForm, PurchaseOrderItemFormSet

def create_purchase_order(request):
    if request.method == "POST":
        po_form = PurchaseOrderForm(request.POST)
        item_formset = PurchaseOrderItemFormSet(request.POST)

        if po_form.is_valid() and item_formset.is_valid():
            # Save the purchase order first
            purchase_order = po_form.save(commit=False)
            purchase_order.created_by = request.user  # Set the creator
            purchase_order.updated_by = request.user  # Set the updater

            # Set status based on button clicked
            if 'save_as_draft' in request.POST:
                purchase_order.status = 'DRAFT'
            elif 'approve_and_save' in request.POST:
                purchase_order.status = 'APPROVED'
            elif 'save_and_submit' in request.POST:
                purchase_order.status = 'SUBMITTED'

            # Save the purchase order to the database
            purchase_order.save()

            # Save the formset (link items to the purchase order)
            item_formset.instance = purchase_order
            item_formset.save()

            # Redirect to PO list or handle specific actions
            if 'save_as_draft' in request.POST or 'approve_and_save' in request.POST:
                return redirect('purchase_order_list')  # Redirect to PO list
            elif 'save_and_submit' in request.POST:
                pdf_url = reverse('po_generate_pdf', args=[purchase_order.purchase_order_id])
                po_list_url = reverse('purchase_order_list')
                return HttpResponse(f"""
                    <html>
                    <body>
                        <script>
                            window.open('{pdf_url}', '_blank');  // Open the PDF in a new tab
                            setTimeout(function() {{
                                window.location.href = '{po_list_url}';  // Redirect to PO list
                            }}, 1000);  // Delay of 1 second
                        </script>
                    </body>
                    </html>
                """, content_type="text/html")
        else:
            # If validation fails, re-render the form with error messages
            return render(request, 'purchase_orders/purchase_order_form.html', {
                'po_form': po_form,
                'item_formset': item_formset,
            })
    else:
        # Handle GET requests (display empty form and formset)
        po_form = PurchaseOrderForm()
        item_formset = PurchaseOrderItemFormSet()

    return render(request, 'purchase_orders/purchase_order_form.html', {
        'po_form': po_form,
        'item_formset': item_formset,
    })




def po_generate_pdf(request, purchase_order_id):
    # Fetch the purchase order
    order = get_object_or_404 (PurchaseOrder, purchase_order_id = purchase_order_id)

    # Create a temporary file for the PDF
    temp_file = tempfile.NamedTemporaryFile (delete = False, suffix = ".pdf")
    generate_purchase_order_pdf (order, temp_file.name)
    temp_file.close ( )

    # Serve the PDF as a file response
    return FileResponse (open (temp_file.name, 'rb'), content_type = 'application/pdf', as_attachment = True,
                         filename = f"PurchaseOrder_{order.purchase_order_id}.pdf")

# edit PO
def edit_purchase_order(request, purchase_order_id):
    # Retrieve the specific purchase order by its primary key (pk)
    purchase_order = get_object_or_404(PurchaseOrder, pk=purchase_order_id)

    if request.method == "POST":
        po_form = PurchaseOrderForm(request.POST, instance=purchase_order)
        item_formset = PurchaseOrderItemFormSet(request.POST, instance=purchase_order)

        # Validate and save the form and formset
        if po_form.is_valid() and item_formset.is_valid():
            po_form.save()
            item_formset.save()
            return redirect('purchase_order_list')  # Redirect to PO list after saving
    else:
        po_form = PurchaseOrderForm(instance=purchase_order)
        item_formset = PurchaseOrderItemFormSet(instance=purchase_order)
        messages.success (request, "Purchase order updated successfully!")

    return render(request, 'purchase_orders/edit_purchase_order.html', {
        'po_form': po_form,
        'item_formset': item_formset,
        'purchase_order': purchase_order,
    })


def delete_purchase_order(request, purchase_order_id):
    purchase_order = get_object_or_404(PurchaseOrder, purchase_order_id=purchase_order_id)
    purchase_order.delete()
    messages.success(request, f"Purchase Order {purchase_order_id} has been deleted successfully.")
    return redirect('purchase_order_list')  # Redirect to the purchase order list page

