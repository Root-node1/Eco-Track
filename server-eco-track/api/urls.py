from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('log', views.log_activity, name='log-activity'),
    path('stats', views.get_stats, name='get-stats'),
    path('climate', views.get_climate, name='get-climate'),
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/logout', views.logout, name='logout'),
    path('profile', views.profile, name='profile'),
]
