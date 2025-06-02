from typing import Any
from django.http import HttpResponseForbidden

class PremiumFeatureMiddleware:
    def __init__(self, get_response):
        self.get_response =get_response

    def __call__(self, request):
        if request.path.startswith('/api/premium') and not request.user.is_premium:
            return HttpResponseForbidden("Premium feature requires a subscription")
        return self.get_response(request)