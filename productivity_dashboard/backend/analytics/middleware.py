import time
from django.utils.deprecation import MiddlewareMixin
from .models import UserActivityLog

class AnalyticsMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
        return None

    def process_response(self, request, response):
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                UserActivityLog.objects.create(
                    user=request.user,
                    endpoint=request.path,
                    method=request.method,
                    status_code=response.status_code,
                    response_time=time.time() - request.start_time
                )
            except Exception as e:
                print(f"Analytics tracking failed: {str(e)}")
        return response

