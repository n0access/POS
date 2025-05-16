from django.shortcuts import render
from django.shortcuts import render, redirect
from .models import Product, UserAudit
from .forms import ProductForm  # We'll create this

def add_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save()
            UserAudit.objects.create(
                user=request.user,
                action=f"Created product: {product.name}"
            )
            return redirect('product_list')  # define this URL later
    else:
        form = ProductForm()
    return render(request, 'pos/add_product.html', {'form': form})

# Create your views here.
def product_list(request):
    products = Product.objects.all()
    return render(request, 'pos/product_list.html', {'products': products})
