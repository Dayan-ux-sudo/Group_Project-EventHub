from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from events.models import Event
from rsvp.models import RSVP
from icalendar import Calendar, Event as ICalEvent
from datetime import timedelta
import io

@shared_task
def send_event_reminder(event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return

    if event.start_time <= timezone.now():
        return

    attendees = RSVP.objects.filter(event=event, status="attending").select_related("user")
    if not attendees.exists():
        return

    emails = [r.user.email for r in attendees if r.user.email]

    subject = f"Reminder: {event.title} starts soon!"
    message = (
        f"Don't forget!\n\n"
        f"{event.title}\n"
        f"{event.start_time.strftime('%A, %d %B %Y at %H:%M')} – {event.end_time.strftime('%H:%M')}\n"
        f"Location: {event.location or 'Online'}\n\n"
        f"See you there!"
    )

    send_mail(
        subject,
        message,
        "no-reply@eventhub.local",
        emails,
        fail_silently=False,
    )


def generate_ics_payload(event_id):
    event = Event.objects.get(id=event_id)

    cal = Calendar()
    cal.add("prodid", "-//EventHub//NONSGML Event//EN")
    cal.add("version", "2.0")

    ical_event = ICalEvent()
    ical_event.add("summary", event.title)
    ical_event.add("description", event.description)
    ical_event.add("dtstart", event.start_time)
    ical_event.add("dtend", event.end_time)
    ical_event.add("location", event.location)
    ical_event.add("organizer", f"MAILTO:{event.organizer.email}")

    cal.add_component(ical_event)

    buffer = io.BytesIO()
    buffer.write(cal.to_ical())
    buffer.seek(0)
    return buffer.getvalue()

@shared_task(autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def generate_ics(event_id):
    return generate_ics_payload(event_id)