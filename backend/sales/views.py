from django.views.generic import ListView, DetailView, CreateView
from django.shortcuts import redirect
from .models import Sale, Customer
from .forms import SaleForm, SaleItemFormSet

class DashboardView(ListView):
    model = Sale
    template_name = 'sales/dashboard.html'
    context_object_name = 'sales_summary'

class SaleListView(ListView):
    model = Sale
    template_name = 'sales/sale_list.html'
    context_object_name = 'sales'

class SaleDetailView(DetailView):
    model = Sale
    template_name = 'sales/sale_detail.html'
    context_object_name = 'sale'

class SaleCreateView(CreateView):
    model = Sale
    form_class = SaleForm
    template_name = 'sales/sale_form.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.POST:
            context['formset'] = SaleItemFormSet(self.request.POST)
        else:
            context['formset'] = SaleItemFormSet()
        return context

    def form_valid(self, form):
        context = self.get_context_data()
        formset = context['formset']
        if formset.is_valid():
            obj = form.save()
            formset.instance = obj
            formset.save()
            return redirect('sales_list')
        return self.render_to_response(self.get_context_data(form=form))

class CustomerListView(ListView):
    model = Customer
    template_name = 'sales/customer_list.html'
    context_object_name = 'customers'

