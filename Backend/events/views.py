from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer
)
from rsvp.serializers import AttendeeSerializer
from notifications.tasks import generate_ics
from django.http import HttpResponse

class IsOrganizerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer == request.user

        
class EventICSExportView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            content = generate_ics.delay(pk).get(timeout=5)  # blocking for simplicity
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        response = HttpResponse(content, content_type="text/calendar")
        response["Content-Disposition"] = f'attachment; filename="event_{pk}.ics"'
        return response


class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.filter(is_public=True).select_related("organizer")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]
    search_fields = ["title", "description", "location"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EventCreateUpdateSerializer
        return EventListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related("organizer")
    serializer_class = EventDetailSerializer
    permission_classes = [IsOrganizerOrReadOnly | permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return EventCreateUpdateSerializer
        return EventDetailSerializer


class EventAttendeesView(generics.ListAPIView):
    serializer_class = AttendeeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        event = self.kwargs["pk"]
        return Event.objects.get(pk=event).rsvp_set.filter(status="attending").select_related("user")