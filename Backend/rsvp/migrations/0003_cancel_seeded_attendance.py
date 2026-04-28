from django.db import migrations


def cancel_seeded_attendance(apps, schema_editor):
    RSVP = apps.get_model("rsvp", "RSVP")
    RSVP.objects.filter(user__email="student@eventhub.local", status="attending").update(status="cancelled")


class Migration(migrations.Migration):
    dependencies = [
        ("rsvp", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(cancel_seeded_attendance, migrations.RunPython.noop),
    ]
