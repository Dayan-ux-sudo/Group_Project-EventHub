from rest_framework import serializers
from .models import Event

class EventListSerializer(serializers.ModelSerializer):
    organizer_email = serializers.ReadOnlyField(source="organizer.email")
    spots_left = serializers.ReadOnlyField()
    category = serializers.CharField(source='category.name', read_only=True)
 
    class Meta:
        model = Event
        fields = [
            "id", "title", "start_time", "end_time", "category",
            "location", "capacity", "spots_left", "organizer_email",
            "is_upcoming",
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    organizer = serializers.ReadOnlyField(source="organizer.email")
    spots_left = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = "__all__"


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "title", "description", "start_time", "end_time", "location",
            "latitude", "longitude", "category", "capacity", "is_public",
        ]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return data