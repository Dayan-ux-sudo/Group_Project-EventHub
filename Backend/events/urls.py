from django.urls import path
from .views import (
    EventListCreateView, EventDetailView, EventAttendeesView, EventICSExportView,
    SchoolListView, OrganizerDashboardSummaryView,
)
from rsvp.views import MyRSVPListView, RSVPView

urlpatterns = [
    path("schools/", SchoolListView.as_view(), name="school-list"),
    path("dashboard/", OrganizerDashboardSummaryView.as_view(), name="organizer-dashboard-summary"),
    path("registrations/", MyRSVPListView.as_view(), name="my-rsvps"),
    path("", EventListCreateView.as_view(), name="event-list-create"),
    path("<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("<int:pk>/attendees/", EventAttendeesView.as_view(), name="event-attendees"),
    path("<int:pk>/rsvp/", RSVPView.as_view(), name="event-rsvp"),
    path("<int:pk>/export-ics/", EventICSExportView.as_view(), name="event-export-ics"),
]
