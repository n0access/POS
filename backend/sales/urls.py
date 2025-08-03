from django.urls import path
from .views import (
    DashboardView, SaleListView, SaleDetailView,
    SaleCreateView, CustomerListView
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='sales_dashboard'),
    path('sales/', SaleListView.as_view(), name='sales_list'),
    path('sales/create/', SaleCreateView.as_view(), name='sale_create'),
    path('sales/<int:pk>/', SaleDetailView.as_view(), name='sale_detail'),
    path('customers/', CustomerListView.as_view(), name='customer_list'),
    ]