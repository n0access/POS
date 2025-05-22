from django import forms
from django.core.exceptions import ValidationError
from .models import InventoryItem, Batch


class InventoryUploadForm (forms.Form):
    file = forms.FileField ( )


class InventoryItemForm (forms.ModelForm):
    class Meta:
        model = InventoryItem
        fields = [
            'item_name', 'unit_cost', 'unit_price',
            'barcode', 'status',
            'min_stock_level', 'max_stock_level', 'product_category'
        ]

    def __init__ (self, *args, **kwargs):
        super ( ).__init__ (*args, **kwargs)
        self.fields [ 'item_name' ].required = True
        self.fields [ 'unit_cost' ].required = True
        self.fields [ 'unit_price' ].required = True
        #self.fields [ 'quantity' ].required = False
        self.fields [ 'barcode' ].required = False
        self.fields [ 'min_stock_level' ].required = False
        self.fields [ 'max_stock_level' ].required = False
        self.fields [ 'product_category' ].required = False
        self.fields [ 'status' ].required = False


class BatchForm (forms.ModelForm):
    class Meta:
        model = Batch
        fields = [
            'batch_quantity', 'batch_unit_cost',  'expiration_date'
        ]

    def clean_unit_cost (self):
        batch_unit_cost = self.cleaned_data.get ('unit_cost')
        if batch_unit_cost <= 0:
            raise ValidationError ('Unit cost must be strictly positive.')
        return batch_unit_cost


    def clean (self):
        cleaned_data = super ( ).clean ( )
        unit_cost = cleaned_data.get ('unit_cost')

        return cleaned_data
