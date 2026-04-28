import secrets

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from events.models import School
from .models import User


class UserSerializer(serializers.ModelSerializer):
    school = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    remove_avatar = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "username",
            "avatar",
            "avatar_url",
            "avatar_size",
            "role",
            "school",
            "remove_avatar",
        ]
        read_only_fields = ["id", "role"]

    def get_school(self, obj):
        if not obj.school_id:
            return None
        return {
            "id": obj.school_id,
            "code": obj.school.code,
            "name": obj.school.name,
        }

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if not obj.avatar:
            return ""
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url

    def update(self, instance, validated_data):
        remove_avatar = validated_data.pop("remove_avatar", False)
        if remove_avatar and instance.avatar:
            instance.avatar.delete(save=False)
            instance.avatar = None
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    school = serializers.SlugRelatedField(
        slug_field="code",
        queryset=School.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ["email", "password", "full_name", "username", "school"]
        extra_kwargs = {"username": {"required": False}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        token = secrets.token_urlsafe(24)
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username", validated_data["email"].split("@")[0]),
            full_name=validated_data.get("full_name", ""),
            school=validated_data.get("school"),
            enrollment_token=token,
            password=validated_data["password"],
        )
        send_mail(
            "EventHub enrollment successful",
            (
                "You have successfully enrolled to EventHub-Campus Event Management System.\n"
                f"Enrollment token: {token}"
            ),
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@eventhub.local"),
            [user.email],
            fail_silently=True,
        )
        return user


class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.DictField(read_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError({"detail": "Email and password required"})

        try:
            user = User.objects.select_related("school").get(email=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"detail": "Invalid email or password"}) from exc

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user, context=self.context).data,
        }
