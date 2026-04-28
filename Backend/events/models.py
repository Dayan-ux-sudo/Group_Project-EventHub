from django.db import models
from django.conf import settings
from django.utils import timezone

class School(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    background_image = models.URLField(blank=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Event(models.Model):
    CATEGORY_CHOICES = [
        ("workshop", "Workshop"),
        ("hackathon", "Hackathon"),
        ("social", "Social"),
        ("academic", "Academic"),
        ("seminar", "Seminar"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=300, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    capacity = models.PositiveIntegerField(default=100, help_text="0 = unlimited")
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
    )
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organized_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        ordering = ["-start_time"]

    def __str__(self):
        return self.title

    @property
    def spots_left(self):
        if self.capacity == 0:
            return "unlimited"
        attending = self.rsvp_set.filter(status="attending").count()
        return max(0, self.capacity - attending)

    @property
    def is_upcoming(self):
        return self.start_time > timezone.now()
