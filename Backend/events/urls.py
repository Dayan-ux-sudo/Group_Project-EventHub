from django.urls import path
from .views import (
    EventListCreateView, EventDetailView, EventAttendeesView, EventICSExportView
)
from rsvp.views import RSVPView

urlpatterns = [
    path("", EventListCreateView.as_view(), name="event-list-create"),
    path("<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("<int:pk>/attendees/", EventAttendeesView.as_view(), name="event-attendees"),
    path("<int:pk>/rsvp/", RSVPView.as_view(), name="event-rsvp"),
    path("<int:pk>/export-ics/", EventICSExportView.as_view(), name="event-export-ics"),
]