from rest_framework import generics, status, permissions
from rest_framework.response import Response
from events.models import Event
from .models import RSVP
from .serializers import RSVPCreateSerializer, AttendeeSerializer

class RSVPView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RSVPCreateSerializer

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk)

        # Check if already RSVPed
        rsvp, created = RSVP.objects.get_or_create(
            user=request.user,
            event=event,
            defaults={"status": "attending"}
        )

        if not created:
            rsvp.status = "attending"
            rsvp.save()

        # Capacity check (simple version)
        attending_count = event.rsvp_set.filter(status="attending").count()
        if event.capacity > 0 and attending_count >= event.capacity:
            rsvp.status = "waitlisted"
            rsvp.save()

        return Response(AttendeeSerializer(rsvp).data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        try:
            rsvp = RSVP.objects.get(user=request.user, event_id=pk)
            rsvp.status = "cancelled"
            rsvp.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RSVP.DoesNotExist:
            return Response({"detail": "Not RSVPed."}, status=status.HTTP_404_NOT_FOUND)