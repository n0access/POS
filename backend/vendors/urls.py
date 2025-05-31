from django.urls import path
from .views import (
    vendor_list_view, vendor_create_view, download_vendors,
    VendorAPIListCreateView, search_vendors, vendor_detail
)


urlpatterns = [
    # Frontend views (if still used)
    path('vendors/add/', vendor_create_view, name='vendor_create_view'),
    path('vendors/download/', download_vendors, name='download_vendors'),

    # API views
    path('vendors/', VendorAPIListCreateView.as_view(), name='vendor_api'),
    path('vendors/search/', search_vendors, name='search_vendors'),
    path('vendors/<str:vendor_id>/', vendor_detail, name='vendor_detail'),
]
