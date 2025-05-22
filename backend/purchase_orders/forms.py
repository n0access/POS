from django import forms
from .models import PurchaseOrder, PurchaseOrderItem, ReceivingLog
from django.forms import inlineformset_factory
from vendors.models import Vendor
from datetime import date, timedelta

class PurchaseOrderForm(forms.ModelForm):
    terms = forms.ChoiceField(
        choices = Vendor.TERMS_CHOICES,
        required = False,
        label = "Payment Terms"
    )
    payment_method = forms.ChoiceField(
        choices = Vendor.PAYMENTS_CHOICES,
        required = False,
        label = "Payment Method"
    )
    order_date = forms.DateField (
        initial = date.today,  # Default to today's date
        widget = forms.DateInput (attrs = {"type": "date"})  # HTML5 date input
    )
    expected_date = forms.DateField (
        initial = lambda: date.today ( ) + timedelta (days = 1),  # Default to tomorrow's date
        widget = forms.DateInput (attrs = {"type": "date"})  # HTML5 date input
    )
    class Meta:
        model = PurchaseOrder
        exclude = [ 'expiration_date' ]  # Hide expiration_date from the form
        fields = ['vendor',  'order_date', 'expected_date', 'notes', 'terms', 'payment_method']

        widgets = {
            'notes': forms.Textarea (attrs = {
                'class': 'form-control notes-box',
                'rows': 4,  # Default height
                'style': 'resize: vertical;',  # Allow vertical resizing only
            }),
        }

    def clean_item (self):
        item = self.cleaned_data.get ('item')
        if not item:
            raise forms.ValidationError ("Item is required.")
        return item


class PurchaseOrderItemForm(forms.ModelForm):
    class Meta:
        model = PurchaseOrderItem
        fields = ['item', 'item_desc', 'quantity', 'unit_cost']



PurchaseOrderItemFormSet = inlineformset_factory(
    PurchaseOrder,
    PurchaseOrderItem,
    form=PurchaseOrderItemForm,
    extra=1,  # No additional blank forms initially
    can_delete=True,  # Allow item deletion
)

# Receiving form
class ReceivingLogForm(forms.ModelForm):
    class Meta:
        model = ReceivingLog
        fields = ['po_item', 'received_quantity', 'expiration_date', 'is_accepted', 'rejection_reason']
        widgets = {
            'rejection_reason': forms.Select(attrs={'class': 'form-control'}),
            'is_accepted': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'received_quantity': forms.NumberInput(attrs={'class': 'form-control'}),
            'expiration_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }
