from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.api_views import InventoryItemViewSet  # same viewset that powers /api/items/

router = DefaultRouter()
router.register(r'products', InventoryItemViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]