from rest_framework import serializers

from .models import RSVP


class RSVPCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = ["status"]
        read_only_fields = ["user", "event"]


class AttendeeSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = RSVP
        fields = ["user", "status", "created_at"]

    def get_user(self, obj):
        request = self.context.get("request")
        avatar_url = ""
        if obj.user.avatar:
            avatar_url = request.build_absolute_uri(obj.user.avatar.url) if request else obj.user.avatar.url
        return {
            "id": obj.user_id,
            "email": obj.user.email,
            "full_name": obj.user.full_name,
            "avatar_url": avatar_url,
            "avatar_size": obj.user.avatar_size,
        }
