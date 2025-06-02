from django.apps import AppConfig

class TaskmanagerConfig(AppConfig):  # Renamed from TasksConfig to match folder name
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'taskmanager'  # Must match the folder name exactly