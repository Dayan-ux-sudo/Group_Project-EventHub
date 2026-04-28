from django.db.models import Count
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.tasks import generate_ics
from rsvp.serializers import AttendeeSerializer

from .models import Event, School
from .serializers import (
    EventCreateUpdateSerializer,
    EventDetailSerializer,
    EventListSerializer,
    SchoolSerializer,
)


class IsOrganizerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_organizer

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            obj.organizer == request.user
            or request.user.is_superuser
            or request.user.role == "superuser_manager"
        )


class EventICSExportView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            content = generate_ics.delay(pk).get(timeout=5)
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)

        response = HttpResponse(content, content_type="text/calendar")
        response["Content-Disposition"] = f'attachment; filename="event_{pk}.ics"'
        return response


class EventListCreateView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]
    search_fields = ["title", "description", "location"]

    def get_queryset(self):
        queryset = Event.objects.select_related("organizer", "school")
        school_code = self.request.query_params.get("school")
        organizer_scope = self.request.query_params.get("organizer_scope")
        if organizer_scope != "mine":
            queryset = queryset.filter(is_public=True)
        if school_code:
            queryset = queryset.filter(school__code=school_code)
        if organizer_scope == "mine" and self.request.user.is_authenticated:
            queryset = queryset.filter(organizer=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EventCreateUpdateSerializer
        return EventListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsOrganizerOrReadOnly()]
        return [permissions.AllowAny()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        school = serializer.validated_data["school"]
        user = self.request.user
        if user.role == "organizer" and user.school_id and user.school_id != school.id:
            raise PermissionDenied("Organizers can only manage events for their school.")
        serializer.save(organizer=user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related("organizer", "school")
    serializer_class = EventDetailSerializer
    permission_classes = [IsOrganizerOrReadOnly | permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class SchoolListView(generics.ListAPIView):
    serializer_class = SchoolSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return School.objects.annotate(event_count=Count("events", distinct=True)).prefetch_related("admins")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class OrganizerDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_organizer:
            return Response({"detail": "Organizer access required."}, status=status.HTTP_403_FORBIDDEN)

        schools = School.objects.annotate(event_count=Count("events", distinct=True)).prefetch_related("admins")
        events = Event.objects.select_related("organizer", "school")

        if request.user.role == "organizer" and request.user.school_id:
            schools = schools.filter(id=request.user.school_id)
            events = events.filter(school_id=request.user.school_id)

        return Response(
            {
                "user_role": request.user.role,
                "schools": SchoolSerializer(schools, many=True, context={"request": request}).data,
                "events": EventListSerializer(events, many=True, context={"request": request}).data,
            }
        )
