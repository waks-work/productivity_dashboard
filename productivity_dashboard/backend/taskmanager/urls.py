from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuickNoteViewSet, TaskViewSet,TaskNoteViewSet, WhiteboardViewSet


router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notes', TaskNoteViewSet, basename='notes')
router.register(r'quick-notes', QuickNoteViewSet, basename='quick-notes')
router.register(r'whiteboards', WhiteboardViewSet, basename='whiteboards')

urlpatterns = [
    path('', include(router.urls)),
]
