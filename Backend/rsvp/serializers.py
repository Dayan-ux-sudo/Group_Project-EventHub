from rest_framework import serializers
from .models import RSVP
from users.serializers import UserSerializer

class RSVPCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = ["status"]
        read_only_fields = ["user", "event"]

class AttendeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RSVP
        fields = ["user", "status", "created_at"]