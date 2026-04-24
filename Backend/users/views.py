from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    VerifyResetCodeSerializer,
    ResetPasswordSerializer
)
from .models import User, PasswordReset
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(APIView):
    """Custom login view that accepts email instead of username"""
    permission_classes = []

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        logger.error(f"Login validation error: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    """Request password reset code via email"""
    permission_classes = []

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            logger.info(f"Password reset code sent to {request.data.get('email')}")
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyResetCodeView(APIView):
    """Verify reset code is valid"""
    permission_classes = []

    def post(self, request):
        serializer = VerifyResetCodeSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                "message": "Reset code is valid",
                "email": request.data.get('email')
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """Reset password with verified code"""
    permission_classes = []

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)