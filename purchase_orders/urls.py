from django.urls import path, include
from rest_framework.routers import DefaultRouter
#from .views import PurchaseOrderViewSet, PurchaseOrderItemViewSet, create_purchase_order
from . import views
router = DefaultRouter()
router.register('purchase_orders', views.PurchaseOrderViewSet, basename='purchase_order')
router.register('purchase_order_items', views.PurchaseOrderItemViewSet, basename='purchase_order_item')

urlpatterns = [
    path('api/', include(router.urls)),
    path ('purchase_orders/', views.purchase_order_list, name = 'purchase_order_list'),

    path('purchase_orders/create-purchase-order/', views.create_purchase_order, name='create_purchase_order'),
    path('purchase-order/<str:purchase_order_id>/pdf/', views.po_generate_pdf, name='po_generate_pdf'),
    path ('purchase_orders/edit-purchase-order/<str:purchase_order_id>/', views.edit_purchase_order, name = 'edit_purchase_order'),
    path('purchase_orders/delete-purchase-order/<str:purchase_order_id>/', views.delete_purchase_order, name='delete_purchase_order'),
    path ('purchase_orders/receiving/<str:po_item_id>/', views.receiving_page, name = 'receive_po'),
    path ('purchase_orders/lookup_po/', views.lookup_po, name = 'lookup_po'),

    path('purchase_orders/autocomplete/', views.autocomplete_po, name='autocomplete_po'),
    path ('purchase_orders/receiving_success/', views.receiving_success, name = 'receiving_success'),
]
