# POS Inventory Management System

A Point of Sale (POS) and Inventory Management web application built with Django.

## Features

- User authentication (login/logout)
- Product management (add, update, delete)
- Inventory tracking
- Sales tracking and reporting
- CSV/Excel import/export
- Printable PDF reports
- REST API with Swagger documentation
- Admin dashboard
- Responsive interface (via Django templates + Bootstrap)
- Role-based access control (Admin/Staff)


## Installation

1. **Clone the repo**

```bash
git clone https://github.com/yourusername/POS.git
cd POS/inventory_management
```

2. **Create and activate a virtual environment**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```


4. **Apply database migrations**

```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create a superuser**

```bash
python manage.py createsuperuser
```

6. **Run the development server**

```bash
python manage.py runserver
```

Open your browser and go to:  
`http://127.0.0.1:8000/api/login/`

## Admin Access

If you forget the admin password, reset it with:
Default credentials admin:changepassword
```bash
python manage.py changepassword admin
```


