from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PasswordReset


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    
    # Display these fields in the list view
    list_display = ("email", "username", "full_name", "is_staff", "is_active", "created_at")
    list_filter = ("is_staff", "is_active", "created_at")
    search_fields = ("email", "username", "full_name")
    ordering = ("-created_at",)
    
    # Fields to display in detail/edit view
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal Info", {"fields": ("full_name", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined", "created_at")}),
    )
    
    # Fields for adding new user
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "full_name"),
        }),
    )


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "is_used", "created_at", "expires_at", "is_valid_display")
    list_filter = ("is_used", "created_at")
    search_fields = ("user__email", "code", "token")
    readonly_fields = ("token", "code", "created_at", "expires_at")
    
    def is_valid_display(self, obj):
        return obj.is_valid()
    is_valid_display.short_description = "Valid"
    is_valid_display.boolean = True
