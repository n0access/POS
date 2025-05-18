from django.core.paginator import Paginator
from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer
from vendors.models import Vendor
from vendors.serializers import VendorSerializer
import logging




logger = logging.getLogger(__name__)  # Setup logging


class PurchaseOrderViewSet(ModelViewSet):
    """
    Handles operations related to Purchase Orders and extends ModelViewSet for
    performing CRUD operations and custom actions.

    This class provides a pre-configured queryset of PurchaseOrder objects and
    utilizes a specified serializer class to handle serialization and
    deserialization of PurchaseOrder instances. It also includes a custom action
    for searching vendors based on query parameters.

    :ivar queryset: A queryset containing all PurchaseOrder objects with
        related `items` pre-fetched.
    :type queryset: QuerySet
    :ivar serializer_class: The serializer class used to serialize and
        deserialize PurchaseOrder objects.
    :type serializer_class: type
    """
    queryset = PurchaseOrder.objects.prefetch_related('items').all()
    serializer_class = PurchaseOrderSerializer

    @action(detail=False, methods=['get'])
    def search_vendors(self, request):
        query = request.GET.get('q', '').strip()
        if query:
            vendors = Vendor.objects.filter(
                company_name__icontains=query
            ) | Vendor.objects.filter(
                contact_name__icontains=query
            ) | Vendor.objects.filter(
                contact_number__icontains=query
            )
            serializer = VendorSerializer(vendors, many=True)
            return Response(serializer.data)
        return Response([])


class PurchaseOrderItemViewSet(ModelViewSet):
    """
    Handles operations related to PurchaseOrderItem, providing basic CRUD capabilities.

    This ViewSet allows creating, retrieving, updating, and deleting purchase order item
    records through API endpoints. It interacts with the PurchaseOrderItem model and uses
    the PurchaseOrderItemSerializer for data serialization and deserialization.

    :ivar queryset: Queryset containing all PurchaseOrderItem objects from the database.
    :type queryset: QuerySet[PurchaseOrderItem]
    :ivar serializer_class: Serializer class used for serializing and deserializing
        PurchaseOrderItem data.
    :type serializer_class: Type[PurchaseOrderItemSerializer]
    """
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer

# P.O.'s list
def purchase_order_list(request):
    purchase_orders = PurchaseOrder.objects.all().order_by('-purchase_order_id')
    paginator = Paginator(purchase_orders, 10)  # Show 10 orders per page
    page = request.GET.get('page', 1)

    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    context = {
        'purchase_orders': purchase_orders,
        'page_obj': page_obj,
        'is_paginated': page_obj.has_other_pages(),
        'paginator': paginator,
    }
    return render(request, 'purchase_orders/purchase_order_list.html', context)
