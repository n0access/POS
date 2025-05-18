import csv
from datetime import date, timedelta
from django.shortcuts import render, redirect
from django.contrib import messages
import pandas as pd
from .models import InventoryItem

def normalize_columns(data):
    column_mapping = {
        'Item Name (Required)': 'item_name',
        'Unit Cost (Required, Numeric)': 'unit_cost',
        'Unit Price (Required, Numeric)': 'unit_price',
        'Quantity (Required, Numeric)': 'quantity',
        'Barcode (Optional)': 'barcode',
        'Min Stock Level (Optional, Default: 1)': 'min_stock_level',
        'Max Stock Level (Optional, Default: 100)': 'max_stock_level',
        'Product Category (Optional, Default: SYSTEM)': 'product_category',
        'Measurement Type (Optional, Default: count)': 'measurement_type',
        'Status (Optional, Default: Active)': 'status',
        'Expiration Date (Optional, Format: MM/DD/YYYY)': 'expiration_date'
    }

    # Rename columns based on the mapping
    data.rename(columns=column_mapping, inplace=True)



def clean_data(data):
    # Define required columns
    required_columns = ['item_name', 'unit_cost', 'unit_price', 'quantity']

    # Define optional columns with default values
    optional_columns_with_defaults = {
        'barcode': '',
        'min_stock_level': 1,
        'max_stock_level': 100,
        'product_category': 'SYSTEM',
        'measurement_type': 'count',
        'status': 'Active',
        'expiration_date': (date.today() + timedelta(days=90)).strftime('%m/%d/%Y'),  # Default to 3 months from today
    }

    # Check for missing required columns
    missing_required = [col for col in required_columns if col not in data.columns]
    if missing_required:
        raise ValueError(f"Missing required columns: {', '.join(missing_required)}")

    # Add missing optional columns with default values
    for col, default in optional_columns_with_defaults.items():
        if col not in data.columns:
            data[col] = default

    # Ensure numeric columns have appropriate types and fill NaN with 0
    numeric_fields = ['unit_cost', 'unit_price', 'quantity', 'min_stock_level', 'max_stock_level']
    data[numeric_fields] = data[numeric_fields].fillna(0).astype(float)

    # Ensure non-numeric fields are filled with appropriate defaults
    non_numeric_fields = ['barcode', 'product_category', 'measurement_type', 'status']
    for field in non_numeric_fields:
        data[field] = data[field].fillna(optional_columns_with_defaults[field])

    # Remove tailing and leading whitespaces
    data [ 'item_name' ] = data [ 'item_name' ].astype (str).str.strip ( )

    # Parse expiration_date to ensure it's in MM/DD/YYYY format
    data['expiration_date'] = pd.to_datetime(data['expiration_date'], errors='coerce').fillna(
        pd.to_datetime(optional_columns_with_defaults['expiration_date'])
    ).dt.strftime('%m/%d/%Y')

    return data

def upload_inventory(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']

        try:
            # Read the uploaded Excel file
            data = pd.read_excel(file)
            data.columns = [col.strip() for col in data.columns]  # Normalize column names
            print(data.head(5))
            print(data.columns)
            # Apply the column mapping to normalize column names
            normalize_columns (data)

            data = clean_data(data)

            # Split valid and invalid data
            valid_data = []
            invalid_data = []
            for _, row in data.iterrows():
                if row['unit_cost'] <= 0 or row['unit_price'] <= 0 or row['item_name']=='':
                    invalid_data.append(row)
                else:
                    valid_data.append(row)

            # Save valid data
            valid_df = pd.DataFrame(valid_data)
            for _, row in valid_df.iterrows():
                InventoryItem.objects.update_or_create(
                    barcode=row['barcode'],
                    defaults={
                        'item_name': row['item_name'],
                        'unit_cost': row['unit_cost'],
                        'unit_price': row['unit_price'],
                        'quantity': row['quantity'],
                        'min_stock_level': row['min_stock_level'],
                        'max_stock_level': row['max_stock_level'],
                        'product_category': row['product_category'],
                        'status': row['status'],
                    }
                )

            # Handle invalid data
            invalid_df = pd.DataFrame(invalid_data)
            request.session['invalid_data'] = invalid_df.to_dict(orient='records')
            messages.success(request, f"Successfully processed {len(valid_df)} valid records.")
            if not invalid_df.empty:
                messages.warning(request, f"{len(invalid_df)} records have issues. Please correct them.")
                return render(request, 'inventory/edit_invalid_data.html', {'invalid_data': invalid_df.to_dict(orient='records')})

        except Exception as e:
            messages.error(request, f"Error processing file: {e}")
            return render(request, 'inventory/upload_inventory.html')

    return render(request, 'inventory/upload_inventory.html')

def process_corrected_data(request):
    if request.method == 'POST':
        corrected_data = []
        for key, value in request.POST.items():
            if '_' in key:  # Skip non-field keys like CSRF token
                row_index, column = key.split('_', 1)
                if len(corrected_data) <= int(row_index):
                    corrected_data.append({})
                corrected_data[int(row_index)][column] = value

        # Save corrected data
        try:
            for row in corrected_data:
                InventoryItem.objects.update_or_create(
                    item_name=row['item_name'],
                    defaults={
                        'item_name': row['item_name'],
                        'unit_cost': float(row['unit_cost']),
                        'unit_price': float(row['unit_price']),
                        'quantity': int(row['quantity']),
                        'min_stock_level': int(row['min_stock_level']),
                        'max_stock_level': int(row['max_stock_level']),
                        'product_category': row['product_category'],
                        'status': row['status'],
                    }
                )
            messages.success(request, "Corrected data successfully processed.")
        except Exception as e:
            messages.error(request, f"Error processing corrected data: {e}")

        return redirect('upload_inventory')

    return redirect('upload_inventory')
