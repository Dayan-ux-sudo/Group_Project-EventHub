from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "full_name", "role", "school", "is_staff", "is_superuser")
    search_fields = ("email", "full_name", "username")
    ordering = ("email",)
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("EventHub", {"fields": ("full_name", "role", "school", "avatar", "avatar_size", "enrollment_token")}),
    )
