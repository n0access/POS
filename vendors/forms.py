from django import forms
from django.core.validators import URLValidator

from .models import Vendor
import re  # Import the re module for regular expressions

class VendorForm(forms.ModelForm):
    class Meta:
        model = Vendor
        fields = '__all__'

    def clean_zip_code(self):
        zip_code = self.cleaned_data.get("zip_code")
        if zip_code and not re.match(r'^\d{5}(-\d{4})?$', zip_code):
            raise forms.ValidationError("Invalid zip code format. Use 12345 or 12345-6789.")
        return zip_code


    def clean_website (self):
        website = self.cleaned_data.get ("website")
        validator = URLValidator ( )
        try:
            if website and not website.startswith (('http://', 'https://')):
                website = f"http://{website}"
            validator (website)
        except forms.ValidationError:
            raise forms.ValidationError ("Enter a valid website URL.")
        return website

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get("phone_number")
        if phone_number and not re.match(r'^\+?1?\d{9,15}$', phone_number):
            raise forms.ValidationError("Phone number must be in the format '+123456789'. Up to 15 digits allowed.")
        return phone_number
