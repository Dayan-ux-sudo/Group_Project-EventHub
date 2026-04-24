# Gmail SMTP Setup for Password Reset Emails

This guide walks you through setting up Gmail SMTP to send password reset codes to users.

## Step 1: Enable 2-Factor Authentication on Your Gmail Account

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll to "2-Step Verification" and click on it
3. Follow the prompts to enable 2-factor authentication

## Step 2: Generate an App Password

1. After enabling 2FA, go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App**: Mail
   - **Device**: Windows PC (or your device type)
3. Click "Generate"
4. Google will display a 16-character password - **copy this**

## Step 3: Update Your `.env` File

Replace the email configuration in your `.env` file with:

```env
# Gmail SMTP Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Password Reset Token Expiration (in hours)
PASSWORD_RESET_TOKEN_EXPIRY=24
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `your-app-password-here` with the 16-character app password from Step 2

## Step 4: Verify Email Configuration (Optional)

Run this command to test the email setup:

```bash
cd Backend
python manage.py shell
```

Then in the Python shell:

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    "Test Email",
    "If you see this, Gmail SMTP is configured correctly!",
    settings.DEFAULT_FROM_EMAIL,
    ["your-email@gmail.com"],
)
print("Email sent successfully!")
```

## How Password Reset Works

### Frontend Flow:
1. User enters email → Frontend calls `/api/auth/forgot-password/`
2. Backend generates 6-digit code and sends it via Gmail
3. User receives email with code
4. User enters code in form → Frontend calls `/api/auth/verify-reset-code/`
5. User enters new password → Frontend calls `/api/auth/reset-password/`
6. Password is updated, code is marked as used

### Database Tables:
- **`users_user`** - User accounts with hashed passwords
- **`users_passwordreset`** - Password reset tokens with:
  - `user` - Associated user
  - `code` - 6-digit code sent to email
  - `token` - Secure reset token (not currently used but available)
  - `created_at` - When code was generated
  - `expires_at` - When code expires (24 hours by default)
  - `is_used` - Whether code has been used

## API Endpoints

### 1. Request Password Reset
```
POST /api/auth/forgot-password/
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "Password reset code sent to your email",
  "code": "123456"
}
```

### 2. Verify Reset Code
```
POST /api/auth/verify-reset-code/
{
  "email": "user@example.com",
  "code": "123456"
}
```
**Response:**
```json
{
  "message": "Reset code is valid",
  "email": "user@example.com"
}
```

### 3. Reset Password
```
POST /api/auth/reset-password/
{
  "email": "user@example.com",
  "code": "123456",
  "password": "NewSecurePassword123"
}
```
**Response:**
```json
{
  "message": "Password has been reset successfully."
}
```

## Troubleshooting

### "Failed to send reset email"
- Check that 2FA is enabled on your Gmail account
- Verify the App Password is correct (copy from Step 2 again)
- Ensure EMAIL_HOST_USER matches your Gmail address exactly

### Code works locally but not in production
- Make sure `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are set in production `.env`
- Check that Gmail SMTP port 587 is not blocked by firewall
- Verify `DEBUG=False` doesn't interfere with email sending

### "Invalid email or password" during login
- This is separate from password reset - check that user exists
- Verify the password was set correctly during registration or reset

## Security Notes

✅ Passwords are hashed with PBKDF2-SHA256 (1.2M iterations)  
✅ Reset codes expire after 24 hours (configurable)  
✅ Reset codes can only be used once  
✅ Email addresses are not exposed in responses for security  
✅ Using App Passwords instead of Gmail password for added security  

## Notes

- Reset codes are **6 digits** for UX simplicity (1M combinations)
- Codes expire in **24 hours** (configurable via `PASSWORD_RESET_TOKEN_EXPIRY`)
- Users can request multiple codes (old ones are automatically deleted)
- The system supports updating dashboard password too!
