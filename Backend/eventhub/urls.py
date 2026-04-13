from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from eventhub.views import root

urlpatterns = [
    path("", root, name="root"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/events/", include("events.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]