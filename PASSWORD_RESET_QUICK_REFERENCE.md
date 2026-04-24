# Password Reset - Quick Reference

## 📋 Quick Setup Checklist

- [ ] Enable 2-Factor Authentication on Gmail account
- [ ] Generate App Password from [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)  
- [ ] Update `.env` file with Gmail credentials
- [ ] Run `python manage.py migrate` to create PasswordReset table
- [ ] Test by visiting `/Forgotpassword` in browser

## 🔌 API Request Examples

### 1. Request Password Reset Code
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Success Response (200):**
```json
{
  "message": "Password reset code sent to your email",
  "code": "123456"
}
```

**Error Response (400):**
```json
{
  "email": ["No account found with this email."]
}
```

### 2. Verify Reset Code
```bash
curl -X POST http://localhost:8000/api/auth/verify-reset-code/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "code":"123456"
  }'
```

**Success Response (200):**
```json
{
  "message": "Reset code is valid",
  "email": "user@example.com"
}
```

**Error Response (400):**
```json
{
  "non_field_errors": ["Reset code has expired or already been used."]
}
```

### 3. Reset Password
```bash
curl -X POST http://localhost:8000/api/auth/reset-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "code":"123456",
    "password":"NewSecurePass123"
  }'
```

**Success Response (200):**
```json
{
  "message": "Password has been reset successfully."
}
```

**Error Response (400):**
```json
{
  "password": ["Password must contain at least one uppercase letter."]
}
```

## 📧 Email Example

**Subject:** Your password reset code

**Body:**
```
Hello John,

You requested a password reset. Use the code below to reset your password:

Reset Code: 123456

This code will expire in 24 hours.

After entering this code, you'll be able to set a new password.

If you didn't request this, please ignore this email.

Best regards,
EventHub Team
```

## 🖥️ Frontend Usage

### Using API Functions
```javascript
// Import from api.js
import { authAPI } from '../api';

// Step 1: Request code
await authAPI.forgotPassword({ email: 'user@example.com' });

// Step 2: Verify code
await authAPI.verifyResetCode({ 
  email: 'user@example.com', 
  code: '123456' 
});

// Step 3: Reset password
await authAPI.resetPassword({ 
  email: 'user@example.com', 
  code: '123456', 
  password: 'NewPassword123' 
});
```

## 📊 Database Inspection

### View Reset Tokens (Django Shell)
```python
from users.models import PasswordReset
from django.utils import timezone

# View all active reset tokens
active = PasswordReset.objects.filter(
    expires_at__gt=timezone.now(),
    is_used=False
)
for r in active:
    print(f"{r.user.email}: {r.code} - expires {r.expires_at}")

# View used tokens
used = PasswordReset.objects.filter(is_used=True).order_by('-created_at')[:5]
for r in used:
    print(f"{r.user.email}: Used at {r.created_at}")
```

### Check User Password Hashing
```python
from users.models import User

user = User.objects.get(email="maryotieno@gmail.com")
print(f"Email: {user.email}")
print(f"Password Hash: {user.password}")
print(f"Is hashed: {'pbkdf2_sha256' in user.password}")
```

## 🔍 Admin Interface

Navigate to `http://localhost:8000/admin` and login to:

### Users Section
- View all registered users
- See created date, last login
- Edit user details
- Change passwords manually

### Password Resets Section
- Monitor active password reset requests
- See which codes are pending/used
- View expiry times
- Track failed attempts

## 🚨 Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "No account found with this email" | Email not registered | User needs to register first |
| "Reset code has expired" | Code older than 24 hours | Request new code |
| "Password must contain uppercase" | Password validation | Add A-Z to password |
| "Passwords don't match" | Confirmation mismatch | Retype confirmation |
| "Failed to send reset email" | Gmail not configured | Update .env with App Password |

## ⏱️ Token Timing

- **Code Expiry**: 24 hours (set in PASSWORD_RESET_TOKEN_EXPIRY)
- **Code Length**: 6 digits (1,000,000 possibilities)
- **Code Format**: Numbers only (0-9)
- **Token Generation**: Uses Python's `secrets.token_urlsafe(50)`

## 🔐 Password Requirements

- **Minimum Length**: 8 characters
- **Must Contain**: Uppercase letter (A-Z)  
- **Must Contain**: Number (0-9)
- **Optional**: Special characters recommended

## 📱 Mobile Testing

Test on mobile by:
1. Using ngrok: `ngrok http 8000` → Add URL to ALLOWED_HOSTS
2. Access from phone: `http://your-ngrok-url/Forgotpassword`
3. Check Gmail on phone to confirm code receiving

## 🐳 Docker Testing

If using Docker:
```bash
# Backend container
docker exec -it eventhub-backend python manage.py shell
from users.models import PasswordReset
print(PasswordReset.objects.count())
```

## 📈 Production Deployment

Before deploying to production:

1. Change `DEBUG=False`
2. Update ALLOWED_HOSTS with domain
3. Set secure Gmail credentials in production environment
4. Add rate limiting (Django REST Throttle)
5. Enable HTTPS only
6. Consider using SendGrid or AWS SES instead of Gmail
7. Add IP whitelist for API if needed
8. Monitor email failures in logs

## 🔗 Useful Links

- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Django Email Backend](https://docs.djangoproject.com/en/5.0/topics/email/)
- [PBKDF2 Security](https://en.wikipedia.org/wiki/PBKDF2)
- [RFC 5234 - Email Format](https://tools.ietf.org/html/rfc5321)
