from django.utils import timezone
from rest_framework import serializers

from .models import Event, School


class SchoolSerializer(serializers.ModelSerializer):
    admin = serializers.SerializerMethodField()
    event_count = serializers.SerializerMethodField()
    upcoming_event_count = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            "id",
            "code",
            "name",
            "description",
            "background_image",
            "event_count",
            "upcoming_event_count",
            "admin",
        ]

    def get_admin(self, obj):
        admin = obj.admins.order_by("id").first()
        if not admin:
            return None
        avatar_url = ""
        request = self.context.get("request")
        if admin.avatar:
            avatar_url = request.build_absolute_uri(admin.avatar.url) if request else admin.avatar.url
        return {
            "id": admin.id,
            "full_name": admin.full_name,
            "email": admin.email,
            "avatar_url": avatar_url,
        }

    def get_event_count(self, obj):
        annotated_value = getattr(obj, "event_count", None)
        if annotated_value is not None:
            return annotated_value
        return obj.events.count()

    def get_upcoming_event_count(self, obj):
        return obj.events.filter(start_time__gt=timezone.now()).count()


class EventListSerializer(serializers.ModelSerializer):
    organizer_email = serializers.ReadOnlyField(source="organizer.email")
    organizer_name = serializers.ReadOnlyField(source="organizer.full_name")
    spots_left = serializers.ReadOnlyField()
    school = SchoolSerializer(read_only=True)
    attendee_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "start_time",
            "end_time",
            "category",
            "location",
            "latitude",
            "longitude",
            "capacity",
            "spots_left",
            "organizer_email",
            "organizer_name",
            "school",
            "attendee_count",
            "is_upcoming",
        ]

    def get_attendee_count(self, obj):
        return obj.rsvp_set.filter(status="attending").count()


class EventDetailSerializer(serializers.ModelSerializer):
    organizer = serializers.SerializerMethodField()
    school = SchoolSerializer(read_only=True)
    spots_left = serializers.ReadOnlyField()
    attendee_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = "__all__"

    def get_organizer(self, obj):
        request = self.context.get("request")
        avatar_url = ""
        if obj.organizer.avatar:
            avatar_url = request.build_absolute_uri(obj.organizer.avatar.url) if request else obj.organizer.avatar.url
        return {
            "id": obj.organizer_id,
            "email": obj.organizer.email,
            "full_name": obj.organizer.full_name,
            "avatar_url": avatar_url,
            "role": obj.organizer.role,
        }

    def get_attendee_count(self, obj):
        return obj.rsvp_set.filter(status="attending").count()


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    school = serializers.SlugRelatedField(slug_field="code", queryset=School.objects.all())

    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "start_time",
            "end_time",
            "location",
            "latitude",
            "longitude",
            "category",
            "capacity",
            "is_public",
            "school",
        ]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return data
