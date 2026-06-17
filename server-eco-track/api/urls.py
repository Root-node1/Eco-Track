from django.urls import path
from . import views

urlpatterns = [
    path('log', views.log_activity, name='log-activity'),
    path('stats', views.get_stats, name='get-stats'),
    path('climate', views.get_climate, name='get-climate'),
]
