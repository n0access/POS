from django.apps import AppConfig


class PurchaseOrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'purchase_orders'


    def ready(self):
        import purchase_orders.signals  # Replace 'yourapp' with the name of your app