# inventory/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import InventoryItemViewSet
from . import views

router = DefaultRouter()
router.register(r'inventory', InventoryItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
   # path('', include(router.urls)),
    path('items/', views.inventory_list_view, name='inventory_list_view'),  # List all items
    path ('items/batches/update/<int:batch_id>/', views.batch_create_view, name ='batch_update_view'),
    path('items/create/', views.inventory_create_view, name='inventory_create_view'),  # Add individual items manually
    path ('items/update/<int:item_id>/', views.inventory_update_view, name ='inventory_update_view'),    # Update individual items manually, with item_id for reference
    path('items/deactivate/<int:item_id>/', views.inventory_delete_view, name='inventory_delete_view'),  # Deactivate individual items manually
    path('items/activate/<int:item_id>/', views.inventory_activate_view, name='inventory_activate_view'),  # New activate URL
    path('items/download/', views.download_inventory, name='download_inventory'),  # Download inventory list
    path('items/download-template/', views.download_template, name='download_template'),
    path('items/upload/', views.upload_inventory, name='upload_inventory'),  # Bulk update inventory using CSV file
    path('items/process-corrected-data/', views.process_corrected_data, name='process_corrected_data'),
    path('items/download_invalid_records/', views.download_invalid_records, name='download_invalid_records'),
    path ('items/search/', views.search_items, name ='search_items'), # search items

# Batch-related URL patterns
    path('batch/create/<int:item_id>/', views.batch_create_view, name='batch_create_view'),
#    path('batch/update/<int:batch_id>/', views.batch_update_view, name='batch_update_view'),
 #   path('batch/delete/<int:batch_id>/', views.batch_delete_view, name='batch_delete_view'),

]
