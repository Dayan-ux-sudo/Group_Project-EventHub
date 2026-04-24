from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PasswordReset
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

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


class ForgotPasswordSerializer(serializers.Serializer):
    """Request password reset code via email"""
    email = serializers.EmailField()

    def validate_email(self, value):
        """Check if user exists"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email.")
        return value

    def save(self):
        """Generate reset token and send email"""
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Create password reset token
        reset = PasswordReset.create_reset_token(user, expiry_hours=settings.PASSWORD_RESET_TOKEN_EXPIRY)
        
        # Send email with reset code
        subject = "Your password reset code"
        message = f"""
        Hello {user.full_name or user.username},

        You requested a password reset. Use the code below to reset your password:

        Reset Code: {reset.code}
        
        This code will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRY} hours.

        After entering this code, you'll be able to set a new password.

        If you didn't request this, please ignore this email.

        Best regards,
        EventHub Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            logger.info(f"Password reset email sent to {email} with code: {reset.code}")
            return {"message": "Password reset code sent to your email", "code": reset.code}
        except Exception as e:
            logger.error(f"Failed to send reset email to {email}: {str(e)}")
            raise serializers.ValidationError("Failed to send reset email. Please try again later.")


class VerifyResetCodeSerializer(serializers.Serializer):
    """Verify reset code and get token"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        
        try:
            user = User.objects.get(email=email)
            reset = PasswordReset.objects.get(user=user, code=code)
            
            if not reset.is_valid():
                raise serializers.ValidationError("Reset code has expired or already been used.")
            
            attrs['reset'] = reset
            attrs['user'] = user
            return attrs
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or reset code.")
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError("Invalid reset code.")


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password using token and new password"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        
        try:
            user = User.objects.get(email=email)
            reset = PasswordReset.objects.get(user=user, code=code)
            
            if not reset.is_valid():
                raise serializers.ValidationError("Reset code has expired or already been used.")
            
            attrs['reset'] = reset
            attrs['user'] = user
            return attrs
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or reset code.")
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError("Invalid reset code.")

    def save(self):
        """Update user password and mark reset as used"""
        user = self.validated_data['user']
        reset = self.validated_data['reset']
        password = self.validated_data['password']
        
        user.set_password(password)
        user.save()
        
        reset.is_used = True
        reset.save()
        
        logger.info(f"Password reset successful for {user.email}")
        return {"message": "Password has been reset successfully."}