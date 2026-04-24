from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, 
    ProfileView, 
    CustomTokenObtainPairView,
    ForgotPasswordView,
    VerifyResetCodeView,
    ResetPasswordView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    
    # Password Reset
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("verify-reset-code/", VerifyResetCodeView.as_view(), name="verify_reset_code"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
]
