from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("organizer", "Organizer"),
        ("superuser_manager", "Superuser Manager"),
    ]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=120, blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="student")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    avatar_size = models.PositiveIntegerField(default=44)
    school = models.ForeignKey(
        "events.School",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admins",
    )
    enrollment_token = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def is_organizer(self):
        return self.role in {"organizer", "superuser_manager"} or self.is_staff or self.is_superuser

    def __str__(self):
        return self.email
