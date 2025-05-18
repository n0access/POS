from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.forms import modelformset_factory
from openpyxl import Workbook
from openpyxl.styles import NamedStyle
from datetime import datetime
import csv
import pandas as pd
from .models import InventoryItem, Batch, category_choices
from .forms import InventoryItemForm, BatchForm
from .upload_inventory_file import upload_inventory, process_corrected_data
from django.db.models import Sum, Min, Avg
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from inventory.models import InventoryItem
from inventory.serializers import InventoryItemSerializer

@api_view(['GET'])
@authentication_classes([TokenAuthentication])  # ✅ Requires Token Authentication
@permission_classes([IsAuthenticated])  # 🔒 Restrict access to authenticated users
def get_inventory_items(request):
    """Return a list of inventory items as JSON"""
    items = InventoryItem.objects.all()
    serializer = InventoryItemSerializer(items, many=True)
    return Response(serializer.data)


def inventory_list_view(request):
    items = InventoryItem.objects.all ( ).annotate (
        closest_expiration_date = Min ('batches__expiration_date'),
        avg_batch_unit_cost = Avg ('batches__batch_unit_cost')
    )
    return render(request, 'inventory/inventory_list.html', {'items': items})
from django.utils.timezone import now
from datetime import timedelta
from django.contrib.auth.decorators import user_passes_test

@login_required
@user_passes_test(lambda u: u.is_superuser)  # Optional: restrict to superusers/admins
def migrate_items_to_batches(request):
    items_without_batches = InventoryItem.objects.annotate(batch_count=models.Count('batches')).filter(batch_count=0, quantity__gt=0)

    created_batches = 0
    for item in items_without_batches:
        expiration_date = now().date() + timedelta(days=180)  # 6 months from now
        Batch.objects.create(
            inventory_item=item,
            batch_quantity=item.quantity,
            batch_unit_cost=item.unit_cost,
            expiration_date=expiration_date
        )
        created_batches += 1

    messages.success(request, f"✅ Created {created_batches} batch(es) for inventory items.")
    return redirect('inventory_list_view')


@login_required
def inventory_create_view(request):
    InventoryItemFormSet = modelformset_factory(InventoryItem, form=InventoryItemForm, extra=1)

    if request.method == 'POST':
        if 'cancel' in request.POST:
            return redirect('inventory_list_view')

        formset = InventoryItemFormSet(request.POST, queryset=InventoryItem.objects.none())
        if formset.is_valid():
            formset.save()
            messages.success(request, "Inventory items have been saved successfully.")
            return redirect('inventory_list_view')
        else:
            print("Formset errors:", formset.errors)
            messages.error(request, "There was an error saving your data. Please check the form for errors.")
    else:
        formset = InventoryItemFormSet(queryset=InventoryItem.objects.none())

    return render(request, 'inventory/inventory_form.html', {
        'formset': formset,
        'category_choices': category_choices
    })


@login_required
def inventory_update_view(request, item_id):
    item = get_object_or_404(InventoryItem, pk=item_id)
    if request.method == "POST":
        form = InventoryItemForm(request.POST, instance=item)
        if form.is_valid():
            form.save()
            messages.success(request, f"Item {item.item_name} updated successfully.")
            return redirect('inventory_list_view')
    else:
        form = InventoryItemForm(instance=item)
    return render(request, 'inventory/update_inventory_item.html', {'form': form})


@login_required
def inventory_delete_view(request, item_id):
    item = get_object_or_404(InventoryItem, item_id=item_id)
    item.status = "INACTIVE"
    item.save()
    messages.success(request, f"Item {item.item_name} has been deactivated.")
    return redirect('inventory_list_view')


@login_required
def inventory_activate_view(request, item_id):
    item = get_object_or_404(InventoryItem, item_id=item_id)
    if item.status.lower() == 'inactive':
        item.status = 'ACTIVE'
        item.save()
        messages.success(request, 'Item successfully activated.')
    return redirect('inventory_list_view')


@login_required
def batch_create_view(request, item_id):
    inventory_item = get_object_or_404(InventoryItem, pk=item_id)
    if request.method == 'POST':
        form = BatchForm(request.POST)
        if form.is_valid():
            batch = form.save(commit=False)
            batch.inventory_item = inventory_item
            batch.save()
            messages.success(request, f"Batch for {inventory_item.item_name} created successfully.")
            return redirect('inventory_list_view')
    else:
        form = BatchForm()

    return render(request, 'inventory/batch_form.html', {'form': form, 'inventory_item': inventory_item})


@login_required
def download_inventory(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="inventory.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Item ID', 'Name', 'Barcode', 'Min Level', 'Max Level',
        'Category', 'Status', 'Last Updated'
    ])

    for item in InventoryItem.objects.all():
        writer.writerow([
            item.item_id, item.item_name, item.barcode,
            item.min_stock_level, item.max_stock_level,
            item.product_category, item.status, item.last_updated
        ])

    return response


def search_items(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse([], safe=False)
    items = InventoryItem.objects.filter(
        Q(item_id__icontains=query) |
        Q(item_name__icontains=query) |
        Q(barcode__icontains=query)
    ).values('item_id', 'item_name', 'unit_cost', 'barcode', 'min_stock_level', 'max_stock_level', 'product_category', 'status')
    return JsonResponse(list(items), safe=False)


def download_excel_file(data, title, fileName):
    wb = Workbook()
    ws = wb.active
    ws.title = title

    headers = [
        'Item Name (Required)', 'Unit Cost (Required, Numeric)',
        'Unit Price (Required, Numeric)', 'Quantity (Required, Numeric)',
        'Barcode (Optional)', 'Min Stock Level (Optional, Default: 1)',
        'Max Stock Level (Optional, Default: 100)', 'Product Category (Optional, Default: SYSTEM)',
        'Measurement Type (Optional, Default: count)', 'Status (Optional, Default: Active)',
        'Expiration Date (Optional, Format: MM/DD/YYYY)'
    ]
    ws.append(headers)

    barcode_style = NamedStyle(name="barcode_style", number_format="@")
    wb.add_named_style(barcode_style)

    for row in data:
        if isinstance(row, dict):
            ws.append([
                row.get('item_name', ''), row.get('unit_cost', 0), row.get('unit_price', 0), row.get('quantity', 0),
                row.get('barcode', ''), row.get('min_stock_level', 1), row.get('max_stock_level', 100),
                row.get('product_category', 'SYSTEM'), row.get('measurement_type', 'count'),
                row.get('status', 'Active'), row.get('expiration_date', ''),
            ])
        else:
            ws.append(row)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{fileName}.xlsx"'
    wb.save(response)
    return response


def download_template(request):
    sample_data = [
        ['Cake', 10.00, 15.00, 100, '00123456', 10, 200, 'Bakery', 'count', 'Active', '07/17/2025'],
        ['American Cheese', 5.00, 7.50, 50, '00098765', 5, 100, 'Deli Cold', 'weight', 'Active', '05/26/2025'],
    ]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    fileName = f"inventory_template_{timestamp}"
    return download_excel_file(sample_data, "Inventory Template", fileName)


def download_invalid_records(request):
    invalid_data = request.session.get('invalid_data', [])
    if not invalid_data:
        messages.error(request, "No invalid data to download.")
        return redirect('upload_inventory')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    fileName = f"invalid_records_{timestamp}"
    return download_excel_file(invalid_data, "Invalid Records", fileName)
