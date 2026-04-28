# Generated manually for EventHub user profile and role support.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0003_school_event_school"),
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="avatar_size",
            field=models.PositiveIntegerField(default=44),
        ),
        migrations.AddField(
            model_name="user",
            name="enrollment_token",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="user",
            name="role",
            field=models.CharField(choices=[("student", "Student"), ("organizer", "Organizer"), ("superuser_manager", "Superuser Manager")], default="student", max_length=30),
        ),
        migrations.AddField(
            model_name="user",
            name="school",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="admins", to="events.school"),
        ),
    ]
