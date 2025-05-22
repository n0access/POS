from django.urls import path

from . import views #import vendor_list_view, vendor_create_view, download_vendors, VendorAPIListCreateView


urlpatterns = [
    path('vendors/', views.vendor_list_view, name='vendor_list_view'),
    path('vendors/add/', views.vendor_create_view, name='vendor_create_view'),
    path('vendors/download/', views.download_vendors, name='download_vendors'),
    path('vendors/', views.VendorAPIListCreateView.as_view(), name='vendor_api'),
    path ('vendors/search/', views.search_vendors, name ='search_vendors'),
    path('vendors/<str:vendor_id>/', views.vendor_detail, name='vendor_detail'),
]
