from django.db import models
from django.conf import settings
from events.models import Event

class RSVP(models.Model):
    STATUS_CHOICES = [
        ("attending", "Attending"),
        ("waitlisted", "Waitlisted"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvp_set")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="attending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["user", "event"]]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} → {self.event.title} ({self.status})"