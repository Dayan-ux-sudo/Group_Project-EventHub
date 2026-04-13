from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "username", "avatar"]
        read_only_fields = ["id"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["email", "password", "full_name", "username"]
        extra_kwargs = {"username": {"required": False}}
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username", validated_data["email"].split("@")[0]),
            full_name=validated_data.get("full_name", ""),
            password=validated_data["password"],
        )
        return user

class CustomTokenObtainPairSerializer(serializers.Serializer):
    """Simple email-based login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.DictField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        print(f"DEBUG: Login attempt with email={email}, password={password}")
        
        if not email or not password:
            print("DEBUG: Missing email or password")
            raise serializers.ValidationError({'detail': 'Email and password required'})
        
        # Get user by email
        try:
            user = User.objects.get(email=email)
            print(f"DEBUG: Found user: {user}, username={user.username}")
        except User.DoesNotExist:
            print(f"DEBUG: User not found for email {email}")
            raise serializers.ValidationError({'detail': 'Invalid email or password'})
        
        # Check password directly (USERNAME_FIELD is 'email', not 'username')
        print(f"DEBUG: Checking password for user {user.email}")
        if not user.check_password(password):
            print("DEBUG: Password check failed")
            raise serializers.ValidationError({'detail': 'Invalid email or password'})
        
        print(f"DEBUG: Password check successful for {user.email}")
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
            }
        }