"""
URL configuration for inventory_management project.

The `urlpatterns` list routes URLs to views_old. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views_old
    1. Add an import:  from my_app import views_old
    2. Add a URL to urlpatterns:  path('', views_old.home, name='home')
Class-based views_old
    1. Add an import:  from other_app.views_old import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf.urls.static import static
from django.conf import settings

schema_view = get_schema_view(
    openapi.Info(
        title="Inventory API",
        default_version='v1',
        description="API documentation for Inventory Management",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def redirect_to_login(request):
    return redirect('login')  # Replace 'login' with 'dashboard' if preferred

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
    path('api/inventory/', include('inventory.api_urls')),
    path('api/', include('vendors.urls')),
    path('api/', include('purchase_orders.urls')),
    path('sales/', include('sales.urls')),
    path('api/', include('accounts.urls')),
    path ('', redirect_to_login),  # Redirect root URL
   # path('inventory/', include('inventory.urls')),  # Include the inventory app URLs
    path ('swagger/', schema_view.with_ui ('swagger', cache_timeout = 0), name = 'schema-swagger-ui'),
    path ('redoc/', schema_view.with_ui ('redoc', cache_timeout = 0), name = 'schema-redoc'),
    path ('select2/', include ('django_select2.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


