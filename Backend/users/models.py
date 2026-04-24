from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets
from datetime import timedelta
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class PasswordReset(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="password_reset")
    token = models.CharField(max_length=100, unique=True, editable=False)
    code = models.CharField(max_length=6, help_text="6-digit code sent to email")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Password Reset"
        verbose_name_plural = "Password Resets"

    def __str__(self):
        return f"Password reset for {self.user.email}"
    
    def is_valid(self):
        """Check if token is still valid and hasn't been used"""
        return timezone.now() < self.expires_at and not self.is_used
    
    @classmethod
    def create_reset_token(cls, user, expiry_hours=24):
        """Create a new password reset token for a user"""
        # Delete any existing reset token
        cls.objects.filter(user=user).delete()
        
        # Generate token and 6-digit code
        token = secrets.token_urlsafe(50)
        code = str(secrets.randbelow(1000000)).zfill(6)
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        
        reset = cls.objects.create(
            user=user,
            token=token,
            code=code,
            expires_at=expires_at
        )
        return reset