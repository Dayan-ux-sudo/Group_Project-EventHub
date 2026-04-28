from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from events.models import Event

from .models import RSVP
from .serializers import AttendeeSerializer, RSVPCreateSerializer

class RSVPView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RSVPCreateSerializer

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk)

        # Book the event for this user (or reactivate a cancelled booking).
        rsvp, created = RSVP.objects.get_or_create(
            user=request.user,
            event=event,
            defaults={"status": "attending"}
        )
        previous_status = rsvp.status if not created else None

        if not created:
            rsvp.status = "attending"
            rsvp.save(update_fields=["status"])

        # Capacity guard.
        attending_count = event.rsvp_set.filter(status="attending").count()
        if event.capacity > 0 and attending_count > event.capacity:
            rsvp.status = "waitlisted"
            rsvp.save(update_fields=["status"])

        # Send an automatic reminder email only when the user is now attending.
        became_attending = rsvp.status == "attending" and (created or previous_status != "attending")
        if became_attending:
            self.send_booking_reminder_email(request.user.email, event)

        return Response(AttendeeSerializer(rsvp, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        try:
            rsvp = RSVP.objects.get(user=request.user, event_id=pk)
            rsvp.status = "cancelled"
            rsvp.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RSVP.DoesNotExist:
            return Response({"detail": "Not RSVPed."}, status=status.HTTP_404_NOT_FOUND)

    def send_booking_reminder_email(self, recipient_email, event):
        if not recipient_email:
            return

        event_start = timezone.localtime(event.start_time)
        event_end = timezone.localtime(event.end_time)
        subject = f"Booking Reminder: {event.title}"
        message = (
            "Your event booking was successful.\n\n"
            f"Event: {event.title}\n"
            f"When: {event_start.strftime('%A, %d %B %Y at %H:%M')} - {event_end.strftime('%H:%M')}\n"
            f"Where: {event.location or 'Online'}\n\n"
            "This is your automatic reminder from EventHub."
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@eventhub.local"),
                recipient_list=[recipient_email],
                fail_silently=False,
            )
        except Exception:
            # Booking should not fail if email delivery fails.
            return


class MyRSVPListView(generics.ListAPIView):
    serializer_class = AttendeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RSVP.objects.filter(user=self.request.user).exclude(status="cancelled").select_related("user", "event")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = []
        for rsvp in queryset:
            event = rsvp.event
            data.append(
                {
                    "id": rsvp.id,
                    "status": rsvp.status,
                    "created_at": rsvp.created_at,
                    "event": {
                        "id": event.id,
                        "title": event.title,
                        "description": event.description,
                        "category": event.category,
                        "location": event.location,
                        "start_time": event.start_time,
                        "end_time": event.end_time,
                        "capacity": event.capacity,
                        "school_code": event.school.code if event.school_id else "",
                        "school_name": event.school.name if event.school_id else "",
                    },
                }
            )
        return Response(data)
