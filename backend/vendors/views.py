import csv
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from .forms import VendorForm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Vendor
from .serializers import VendorSerializer


# Web views (require login)
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
def download_vendors(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="vendors.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Vendor ID', 'Company Name', 'Contact Name', 'Address Line 1',
        'Address Line 2', 'City', 'State', 'Zip Code', 'Phone Number',
        'Email', 'Terms', 'Payment Method', 'Website', 'Status', 'Notes'
    ])

    for item in Vendor.objects.all():
        writer.writerow([
            item.vendor_id, item.company_name, item.contact_name, item.address_line1,
            item.address_line2, item.city, item.state, item.zip_code, item.phone_number,
            item.email, item.terms, item.payment_method, item.website, item.status, item.notes
        ])

    return response


# API view (open/public)
class VendorAPIListCreateView(APIView):
    permission_classes = [AllowAny]  # 👈 Make public for now

    def get(self, request):
        vendors = Vendor.objects.all()
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# AJAX search API
def search_vendors(request):
    query = request.GET.get('q', '').strip()
    vendors = Vendor.objects.filter(
        company_name__icontains=query
    ).values('vendor_id', 'company_name', 'contact_name', 'phone_number')
    return JsonResponse(list(vendors), safe=False)


# AJAX vendor detail
def vendor_detail(request, vendor_id):
    try:
        vendor = Vendor.objects.get(vendor_id=vendor_id)
        return JsonResponse({
            'payment_terms': vendor.terms,
            'payment_method': vendor.payment_method
        })
    except Vendor.DoesNotExist:
        return JsonResponse({'error': 'Vendor not found'}, status=404)
