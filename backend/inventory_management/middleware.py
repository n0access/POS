from django.shortcuts import redirect
from django.urls import reverse


class LoginRequiredMiddleware:
    """Middleware that requires a user to be authenticated to access any page other than login and API requests."""

    def __init__ (self, get_response):
        self.get_response = get_response

    def __call__ (self, request):
        # Exclude API endpoints from redirection
        if request.path.startswith ('/api/') or request.user.is_authenticated or request.path.startswith (
                reverse ('login')):
            return self.get_response (request)

        return redirect ('login')
