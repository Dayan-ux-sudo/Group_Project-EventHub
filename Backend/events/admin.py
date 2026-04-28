from django.contrib import admin

from .models import Event, School


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    search_fields = ("code", "name")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "school", "organizer", "category", "start_time", "capacity", "is_public")
    list_filter = ("school", "category", "is_public")
    search_fields = ("title", "description", "location", "organizer__email")
