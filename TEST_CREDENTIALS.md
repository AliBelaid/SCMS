# Test Login Credentials

## Available Test Users (from Seed Data)

### Admin User
- **Code**: `ADMIN001`
- **Password**: `Admin123`
- **Email**: admin@taxmanager.com
- **Role**: Admin

### Member Users
- **Code**: `MEMBER001`
- **Password**: `Member123!`
- **Email**: member1@example.com
- **Role**: Member

- **Code**: `MEMBER002`
- **Password**: `Member123!`
- **Email**: member2@example.com
- **Role**: Member

- **Code**: `MEMBER003`
- **Password**: `Member123!`
- **Email**: member3@example.com
- **Role**: Member

---

## Quick Test Examples

### Test Login in Flutter App
```dart
// Using MEMBER002
final user = await authApi.login('MEMBER002', 'Member123!');
```

### Test Login with cURL
```bash
curl -X POST https://localhost:6001/api/Account/login \
  -H "Content-Type: application/json" \
  -d '{"code":"MEMBER002","password":"Member123!"}' \
  -k
```

### Test Login with Postman
- **Method**: POST
- **URL**: `https://localhost:6001/api/Account/login`
- **Body** (JSON):
```json
{
  "code": "MEMBER002",
  "password": "Member123!"
}
```

---

## Error Messages

The login now returns clear, short error messages:

| Error | Message |
|-------|---------|
| Empty code | "User code is required" |
| Empty password | "Password is required" |
| User not found | "Invalid user code or password" |
| Wrong password | "Invalid user code or password" |
| Account disabled | "Account is disabled" |
| System error | "System error. Please try again" |
| Network error | "No internet connection" |
| Timeout | "Connection timeout. Check your internet" |

---

## Notes

- All passwords are case-sensitive
- User codes are case-sensitive (uppercase)
- Member passwords include special character: `!`
- Admin password does NOT include special character

---

**Created**: December 7, 2025

