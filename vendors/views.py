import csv
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, response, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from .forms import VendorForm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Vendor
from .serializers import VendorSerializer



@login_required
def vendor_list_view(request):
    vendors = Vendor.objects.all()
    return render(request, 'vendors/vendor_list.html', {'vendors': vendors})

@login_required
def vendor_create_view(request):
    if request.method == 'POST':
        form = VendorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(reverse('vendor_list_view'))
    else:
        form = VendorForm()
    return render(request, 'vendors/vendor_form.html', {'form': form})

@login_required
def download_vendors (request):
    # Generate CSV file for download
    vendor_response = HttpResponse (content_type = 'text/csv')
    vendor_response [ 'Content-Disposition' ] = 'attachment; filename="vendors.csv"'

    writer = csv.writer (vendor_response)
    writer.writerow ([
        'Vendor ID', 'Company Name', 'Contact Name', 'Address Line 1',
        'Address Line 2', 'City', 'State', 'Zip Code', 'Phone Number',
        'Email', 'Terms', 'Payment Method', 'Website', 'Status', 'Notes'
    ])

    for item in Vendor.objects.all ( ):
        writer.writerow ([
            item.vendor_id, item.company_name, item.contact_name, item.address_line1,
            item.address_line2, item.city, item.state, item.zip_code, item.phone_number,
            item.email, item.terms, item.payment_method, item.website, item.status, item.notes
        ])
    return vendor_response

'''
@login_required
def vendor_update_view(request, vendor_id):
    vendor = get_object_or_404(Vendor, vendor_id=vendor_id)
    if request.method == "POST":
        form = VendorForm(request.POST, instance=vendor)
        if form.is_valid():
            form.save()
            return redirect('vendor_list_view')  # Replace with your inventory list URL name
    else:
        form = VendorForm(instance=vendor)
    return render(request, 'vendors/vendor_form.html', {'form': form})


@login_required
def vendor_deactivate_view (request, vendor_id):
    vendor = get_object_or_404 (Vendor, vendor_id = vendor_id)
    vendor.status = "INACTIVE"  # Set the vendor status to inactive to 'deactivate' it
    vendor.save ( )
    messages.success (request, f"Vendor {Vendor.company_name} has been deactivated.")
    return redirect ('vendor_list_view')  # Redirect back to the vendor list view


@login_required
def vendor_activate_view(request, vendor_id):
    vendor = get_object_or_404(Vendor, vendor_id = vendor_id)
    if vendor.status.lower() == 'inactive':
        vendor.status = 'ACTIVE'
        vendor.save()
        messages.success(request, f"Vendor {Vendor.company_name} successfully activated.")
    return redirect('vendor_list_view')
'''

class VendorAPIListCreateView(APIView):
    """
    Handles GET and POST requests for Vendor objects via API.
    """
    def get(self, request):
        # Get all vendors and serialize them
        vendors = Vendor.objects.all()
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Create a new vendor using POSTed data
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# search vendors
def search_vendors(request):
    query = request.GET.get('q', '').strip()
    vendors = Vendor.objects.filter(
        company_name__icontains=query
    ).values('vendor_id', 'company_name', 'contact_name', 'phone_number')
    return JsonResponse(list(vendors), safe=False)

# vendor details
def vendor_detail(request, vendor_id):
    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
        return JsonResponse({
            'payment_terms': vendor.terms,
            'payment_method': vendor.payment_method
        })
    except Vendor.DoesNotExist:
        return JsonResponse({'error': 'Vendor not found'}, status=404)