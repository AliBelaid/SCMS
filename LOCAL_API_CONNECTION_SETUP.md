# Local API Connection Setup Guide

## 🎯 Your API is Running On:

```
HTTP:  http://localhost:5000
HTTPS: https://localhost:5001
```

---

## 📱 Flutter App Configuration

### For Android Emulator (Default)

The Flutter app is configured to use: `https://10.0.2.2:5001/api`

**Why?**
- `10.0.2.2` is the special IP that Android Emulator uses to access the host machine's `localhost`
- Port `5001` matches your HTTPS API
- SSL certificate bypass is already configured for development

**File**: `visitor_pos_app/lib/core/constants/api_endpoints.dart`
```dart
static const String baseUrl = "https://10.0.2.2:5001/api";
```

### For Physical Android Device

1. **Find your PC's IP address:**
   ```powershell
   # Windows
   ipconfig
   # Look for IPv4 Address: 192.168.x.x
   ```

   ```bash
   # Mac/Linux
   ifconfig
   # Look for inet address: 192.168.x.x
   ```

2. **Update the baseUrl:**
   ```dart
   static const String baseUrl = "https://192.168.1.XXX:5001/api";
   ```

3. **Allow firewall access (Windows):**
   ```powershell
   New-NetFirewallRule -DisplayName "ASP.NET Core API" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
   ```

### For iOS Simulator

```dart
static const String baseUrl = "https://localhost:5001/api";
```

---

## ✅ SSL Certificate Configuration

The `api_client.dart` already includes SSL certificate bypass for development:

- ✅ `localhost` - iOS Simulator, Desktop
- ✅ `10.0.2.2` - Android Emulator
- ✅ `192.168.x.x` - Local network IPs
- ✅ `172.x.x.x` - Local network IPs  
- ✅ `10.x.x.x` - Local network IPs (except 10.0.2.x)

**⚠️ IMPORTANT**: This SSL bypass is for **DEVELOPMENT ONLY**. Remove it in production!

---

## 🧪 Test Connection

### Test Login

```dart
// In your Flutter app
try {
  final user = await authApi.login('MEMBER002', 'Member123!');
  print('✅ Login successful: ${user.userName}');
} catch (e) {
  print('❌ Login failed: $e');
}
```

### Test with cURL

```bash
# Test login endpoint
curl -X POST https://localhost:5001/api/Account/login \
  -H "Content-Type: application/json" \
  -d '{"code":"MEMBER002","password":"Member123!"}' \
  -k
```

---

## 🔧 Troubleshooting

### Issue: "No internet connection"

**Problem**: Flutter can't reach the API

**Solutions:**
1. ✅ Verify API is running (check terminal for "Now listening on...")
2. ✅ Check baseUrl matches your device type
3. ✅ For physical device: Ensure same Wi-Fi network
4. ✅ For physical device: Check firewall allows port 5001

### Issue: "Connection timeout"

**Problem**: Network request is timing out

**Solutions:**
1. ✅ Increase timeout in `api_client.dart` (currently 30 seconds)
2. ✅ Check if API is responding: `curl https://localhost:5001/api/Account/login`
3. ✅ For physical device: Verify IP address is correct

### Issue: "SSL Handshake Failed"

**Problem**: Self-signed certificate rejected

**Solution:**
- ✅ Already handled! The `badCertificateCallback` in `api_client.dart` allows self-signed certificates for localhost and local IPs

### Issue: "401 Unauthorized"

**Problem**: Login credentials incorrect

**Solutions:**
- ✅ Test credentials:
  - Code: `MEMBER002`
  - Password: `Member123!`
- ✅ Check if user exists in database
- ✅ Verify password matches (case-sensitive!)

### Issue: "Connection refused" on Physical Device

**Problem**: Can't connect to PC's IP

**Solutions:**
1. ✅ Find PC IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. ✅ Update baseUrl with correct IP: `https://192.168.1.XXX:5001/api`
3. ✅ Add firewall rule:
   ```powershell
   New-NetFirewallRule -DisplayName "ASP.NET Core API" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
   ```
4. ✅ Ensure both devices on same Wi-Fi network

---

## 📊 Current Configuration Summary

| Device Type | Base URL | Status |
|------------|----------|--------|
| Android Emulator | `https://10.0.2.2:5001/api` | ✅ Configured |
| Physical Android | `https://YOUR_IP:5001/api` | ⚠️ Update IP |
| iOS Simulator | `https://localhost:5001/api` | ⚠️ Need to change |
| Desktop | `https://localhost:5001/api` | ⚠️ Need to change |

---

## 🚀 Quick Start

1. **Start your API** (already running):
   ```bash
   cd API
   dotnet run
   ```

2. **For Android Emulator** - No changes needed! ✅

3. **For Physical Device** - Update baseUrl:
   - Find IP: `ipconfig`
   - Change: `https://YOUR_IP:5001/api`

4. **Run Flutter app**:
   ```bash
   cd visitor_pos_app
   flutter run
   ```

5. **Test login**:
   - Code: `MEMBER002`
   - Password: `Member123!`

---

## ✅ Verification Checklist

- [ ] API is running on port 5001
- [ ] Flutter app baseUrl matches device type
- [ ] SSL certificate bypass is enabled (for dev)
- [ ] Firewall allows port 5001 (for physical device)
- [ ] Both devices on same Wi-Fi (for physical device)
- [ ] Login works with MEMBER002 / Member123!

---

**Your API is ready at: `https://localhost:5001`** 🎉

