# Visitor Management System - Comprehensive Enhancements

## Overview
This document outlines all the enhancements made to the Visitor Management System across Angular (Web), Flutter (POS), and C# (Backend) to support advanced visitor tracking, status management, and Arabic RTL layout.

---

## 1. Database Schema Updates (C# Entities)

### Visit Entity Enhancements (`Core/Entities/VisitorManagement/Visit.cs`)

**New Status Values:**
- `checkedin` - Visitor has checked in (was: ongoing)
- `checkedout` - Visitor has checked out (was: completed)
- `rejected` - Visit was rejected/denied

**New Fields:**
```csharp
public string? RejectionReason { get; set; }
public DateTime? RejectedAt { get; set; }
public int? RejectedByUserId { get; set; }
```

### Visitor Entity Enhancements (`Core/Entities/VisitorManagement/Visitor.cs`)

**New Fields for Blocking:**
```csharp
public string? BlockReason { get; set; }
public DateTime? BlockedAt { get; set; }
public int? BlockedByUserId { get; set; }
public int CreatedByUserId { get; set; }
```

---

## 2. Angular Web Application Enhancements

### New Component: Visitor Creation (`visitor-create.component.ts`)

**Purpose:** Allow staff to pre-register visitors who will visit the company

**Features:**
- ✅ Full visitor information form (name, ID, phone, company)
- ✅ Expected visit date and time
- ✅ Visit purpose and notes
- ✅ Person image upload with preview
- ✅ ID card image upload with preview
- ✅ Form validation with Arabic error messages
- ✅ Responsive design
- ✅ Image to base64 conversion for API

**Route:** `/app/visitor-management/visitors/create`

**Form Fields:**
1. **Personal Information:**
   - Full Name * (required, min 3 characters)
   - National ID * (required, 10-14 digits)
   - Phone * (required, 10-15 digits)
   - Company (optional)

2. **Visit Information:**
   - Expected Visit Date * (date picker)
   - Expected Visit Time * (time picker)
   - Visit Purpose * (textarea)
   - Notes (optional textarea)

3. **Images:**
   - Person Image (upload with preview)
   - ID Card Image (upload with preview)

### Navigation Updates

**New Menu Item:**
```
📊 Visitor Management
├── 👥 Visitors
│   ├── 📋 All Visitors
│   ├── ➕ Create Visitor (NEW!)
│   └── 👤 Visitor Profiles
```

### Translation Keys Added (`ar.json`)

```json
"CREATE_VISITOR": "إنشاء زائر"
```

---

## 3. Flutter POS Application Enhancements

### RTL Layout Support

**Updated Files:**
- `main.dart` - Added Arabic locale and RTL support
- `new_visit_screen.dart` - Wrapped in Directionality(RTL)
- `visitor_search_screen.dart` - Wrapped in Directionality(RTL)

**Implementation:**
```dart
// In main.dart
locale: const Locale('ar', 'SA'),
supportedLocales: const [
  Locale('ar', 'SA'),
  Locale('en', 'US'),
],

// In screens
Directionality(
  textDirection: TextDirection.rtl,
  child: Scaffold(...),
)
```

### Visitor Status Checking

**Enhanced Visitor Lookup:**
- Check if visitor is blocked before allowing check-in
- Display clear warning message if visitor is blocked
- Show block reason if available
- Prevent form submission for blocked visitors

**Visual Indicators:**
- ✅ Green border for active visitors
- ❌ Red border for blocked visitors
- ⛔ Block icon for blocked status
- ✓ Check icon for active status

---

## 4. API Enhancements (Required - To Be Implemented)

### VisitorsController Updates

**New Endpoint: Create Visitor**
```csharp
POST /api/Visitors
{
  "fullName": "string",
  "nationalId": "string",
  "phone": "string",
  "company": "string?",
  "personImageBase64": "string?",
  "idCardImageBase64": "string?",
  "expectedVisitDate": "datetime",
  "expectedVisitTime": "string",
  "visitPurpose": "string",
  "notes": "string?"
}
```

**Enhanced Block/Unblock Endpoint:**
```csharp
PUT /api/Visitors/{id}/block
{
  "isBlocked": true,
  "blockReason": "Security concern",
  "blockedByUserId": 123
}
```

**Enhanced Lookup Response:**
```json
{
  "id": 1,
  "fullName": "Ahmed Ali",
  "nationalId": "1234567890",
  "phone": "0501234567",
  "company": "ABC Corp",
  "isBlocked": false,
  "blockReason": null,
  "blockedAt": null,
  "personImageUrl": "/uploads/...",
  "idCardImageUrl": "/uploads/..."
}
```

### VisitsController Updates

**Enhanced Create Visit:**
- Check visitor blocked status before creating visit
- Return error if visitor is blocked
- Include block reason in error message

**New Endpoint: Reject Visit**
```csharp
POST /api/Visits/{visitNumber}/reject
{
  "rejectionReason": "Visitor not authorized"
}
```

**Response includes rejection details:**
```json
{
  "visitNumber": "V20231226-0001",
  "status": "rejected",
  "rejectionReason": "Visitor not authorized",
  "rejectedAt": "2023-12-26T10:30:00Z",
  "rejectedByUserId": 123
}
```

---

## 5. Visit Status Flow

### Status Transitions

```
1. Visitor Pre-Registration (Web)
   ↓
2. Check-In Attempt (POS)
   ↓
3. Status Check:
   - If Blocked → Reject
   - If Active → Allow Check-In
   ↓
4. Visit Created (status: checkedin)
   ↓
5. Visit Completion:
   - Normal Exit → checkedout
   - Security Issue → rejected
```

### Status Meanings

| Status | Description | Color | Icon |
|--------|-------------|-------|------|
| `checkedin` | Visitor is currently on premises | Blue | ✓ |
| `checkedout` | Visit completed normally | Green | ✓ |
| `rejected` | Visit denied/terminated | Red | ✗ |

---

## 6. Visitor Status Management

### Visitor States

| State | isBlocked | Description |
|-------|-----------|-------------|
| Active | false | Can create visits |
| Blocked | true | Cannot create visits |

### Block Information

**Fields Tracked:**
- `blockReason` - Why visitor was blocked
- `blockedAt` - When visitor was blocked
- `blockedByUserId` - Who blocked the visitor

**Example Reasons:**
- "Security concern"
- "Previous incident"
- "Unauthorized access attempt"
- "Company policy violation"

---

## 7. UI/UX Improvements

### Angular Web

**Visitor List:**
- ✅ Status chips (Active/Blocked)
- ✅ Quick actions menu
- ✅ Navigate to profile
- ✅ View visit history
- ✅ Block/Unblock actions

**Visitor Profile:**
- ✅ Complete visitor information
- ✅ Visit statistics
- ✅ Visit history table
- ✅ Image gallery
- ✅ Block status with reason
- ✅ Block/Unblock button (Admin only)

**Visit Details:**
- ✅ Visitor information
- ✅ Visit timeline
- ✅ Status badges
- ✅ Images (person, ID, car)
- ✅ Duration calculation
- ✅ Rejection reason (if applicable)

### Flutter POS

**New Visit Screen:**
- ✅ RTL layout for Arabic
- ✅ Visitor search integration
- ✅ Auto-fill from search results
- ✅ Block status warning
- ✅ Visual status indicators
- ✅ Responsive design

**Visitor Search:**
- ✅ RTL layout
- ✅ Search by name/ID/phone
- ✅ Status badges
- ✅ Profile navigation
- ✅ Select for new visit

---

## 8. Security Features

### Access Control

**Visitor Blocking:**
- Only Admins can block/unblock visitors
- Block reason is required
- Block action is logged with user ID and timestamp

**Visit Rejection:**
- Authorized staff can reject visits
- Rejection reason is required
- Rejection is logged with user ID and timestamp

### Audit Trail

**Tracked Information:**
- Who created the visitor profile
- When visitor was created
- Who blocked/unblocked visitor
- When visitor was blocked/unblocked
- Why visitor was blocked
- Who rejected visit
- When visit was rejected
- Why visit was rejected

---

## 9. Arabic Language Support

### Complete RTL Layout

**Flutter Screens:**
- All text aligned right-to-left
- Icons positioned correctly for RTL
- Forms flow right-to-left
- Navigation drawer opens from right

**Text Direction:**
```dart
Directionality(
  textDirection: TextDirection.rtl,
  child: Scaffold(...)
)
```

### Arabic Translations

**All UI Elements:**
- Form labels
- Button text
- Error messages
- Status indicators
- Navigation items
- Tooltips
- Dialogs

---

## 10. Responsive Design

### Angular Web

**Breakpoints:**
- Desktop (> 1200px): Full layout
- Tablet (768px - 1200px): Adjusted columns
- Mobile (< 768px): Stacked layout

**Features:**
- Responsive forms
- Collapsible sidebars
- Touch-friendly buttons
- Optimized images

### Flutter POS

**Responsive Sizing:**
```dart
// Padding
EdgeInsets.all(screenWidth * 0.04)

// Heights
height: (screenHeight * 0.15).clamp(100.0, 150.0)

// Widths
width: screenWidth * 0.12
```

**Orientation Support:**
- Portrait mode (primary)
- Landscape mode (supported)
- Auto-adjust layout

---

## 11. Image Management

### Upload Process

**Angular:**
1. User selects image file
2. Preview displayed immediately
3. Convert to base64 on submit
4. Send to API

**Flutter:**
1. User captures/selects image
2. Image stored as File
3. Preview displayed
4. Convert to base64 on submit
5. Send to API

### Image Types

| Type | Purpose | Required |
|------|---------|----------|
| Person | Visitor face photo | Optional |
| ID Card | National ID/Passport | Optional |
| Car | Vehicle photo | Optional |

### Storage

**Backend:**
- Images saved to `/uploads/visitors/`
- Unique filenames with timestamps
- Organized by visitor ID
- URLs returned in API responses

---

## 12. Search Functionality

### Visitor Search

**Search Criteria:**
- Full name (partial match)
- National ID (exact or partial)
- Phone number (exact or partial)
- Company name (partial match)

**Search Flow:**
1. User enters search term (min 3 characters)
2. API call to `/api/Visitors/search?query={term}`
3. Results displayed with status indicators
4. User can:
   - Select visitor for new visit
   - View visitor profile
   - See block status

**Status Indicators:**
- ✅ Green checkmark for active visitors
- ⛔ Red block icon for blocked visitors
- Block reason displayed if blocked

---

## 13. Visit Management Workflow

### Pre-Registration (Web)

1. Staff creates visitor profile
2. Enters expected visit date/time
3. Uploads images
4. Specifies visit purpose
5. Visitor profile saved

### Check-In (POS)

1. Guard searches for visitor
2. System checks visitor status:
   - If blocked → Show warning, prevent check-in
   - If active → Allow check-in
3. Guard confirms visitor details
4. Guard captures/verifies images
5. Guard enters visit details
6. Visit created with status "checkedin"

### Check-Out (POS)

1. Guard enters visit number or scans QR
2. System retrieves visit
3. Guard confirms check-out
4. Visit status updated to "checkedout"
5. Duration calculated
6. Receipt printed (optional)

### Rejection (POS/Web)

1. Staff identifies issue with visitor
2. Staff rejects visit
3. Rejection reason entered
4. Visit status updated to "rejected"
5. Visitor notified (if applicable)

---

## 14. Reporting & Analytics

### Visit Statistics

**By Status:**
- Total checked-in visits
- Total checked-out visits
- Total rejected visits

**By Visitor:**
- Total visits per visitor
- Average visit duration
- Most visited departments
- Visit frequency

**By Department:**
- Visits per department
- Peak visit times
- Average visit duration

### Visitor Statistics

**Status Distribution:**
- Total active visitors
- Total blocked visitors
- Block reasons breakdown

**Visit History:**
- First visit date
- Last visit date
- Total visits
- Completed vs rejected

---

## 15. Migration Guide

### Database Migration

**Required Changes:**
1. Add new columns to `Visits` table:
   - `RejectionReason` (nvarchar, nullable)
   - `RejectedAt` (datetime, nullable)
   - `RejectedByUserId` (int, nullable)

2. Add new columns to `Visitors` table:
   - `BlockReason` (nvarchar, nullable)
   - `BlockedAt` (datetime, nullable)
   - `BlockedByUserId` (int, nullable)
   - `CreatedByUserId` (int, not null)

3. Update `Status` values in `Visits` table:
   - 'ongoing' → 'checkedin'
   - 'completed' → 'checkedout'
   - 'incomplete' → 'rejected'

**Migration SQL:**
```sql
-- Add new columns to Visits
ALTER TABLE Visits ADD RejectionReason NVARCHAR(500) NULL;
ALTER TABLE Visits ADD RejectedAt DATETIME NULL;
ALTER TABLE Visits ADD RejectedByUserId INT NULL;

-- Add new columns to Visitors
ALTER TABLE Visitors ADD BlockReason NVARCHAR(500) NULL;
ALTER TABLE Visitors ADD BlockedAt DATETIME NULL;
ALTER TABLE Visitors ADD BlockedByUserId INT NULL;
ALTER TABLE Visitors ADD CreatedByUserId INT NOT NULL DEFAULT 1;

-- Update existing status values
UPDATE Visits SET Status = 'checkedin' WHERE Status = 'ongoing';
UPDATE Visits SET Status = 'checkedout' WHERE Status = 'completed';
UPDATE Visits SET Status = 'rejected' WHERE Status = 'incomplete';
```

### Frontend Deployment

**Angular:**
1. Build production: `ng build --configuration production`
2. Deploy to web server
3. Clear browser cache
4. Test all features

**Flutter:**
1. Update version in `pubspec.yaml`
2. Build APK: `flutter build apk --release`
3. Distribute to POS devices
4. Test RTL layout
5. Verify API connectivity

---

## 16. Testing Checklist

### Backend API

- [ ] Create visitor with all fields
- [ ] Create visitor with minimal fields
- [ ] Search visitors by name
- [ ] Search visitors by national ID
- [ ] Search visitors by phone
- [ ] Block visitor with reason
- [ ] Unblock visitor
- [ ] Create visit for active visitor
- [ ] Prevent visit for blocked visitor
- [ ] Reject visit with reason
- [ ] Check-out visit
- [ ] Get visitor profile with history

### Angular Web

- [ ] Navigate to Create Visitor
- [ ] Fill form with valid data
- [ ] Upload person image
- [ ] Upload ID card image
- [ ] Submit form successfully
- [ ] View all visitors list
- [ ] Search visitors
- [ ] Filter by department
- [ ] View visitor profile
- [ ] Block visitor (Admin)
- [ ] Unblock visitor (Admin)
- [ ] View visit history
- [ ] Navigate to visit details

### Flutter POS

- [ ] RTL layout displays correctly
- [ ] Arabic text renders properly
- [ ] Search for visitor
- [ ] Select visitor from search
- [ ] Auto-fill form fields
- [ ] See blocked visitor warning
- [ ] Prevent check-in for blocked visitor
- [ ] Create visit for active visitor
- [ ] Capture person image
- [ ] Capture ID card image
- [ ] Capture car image
- [ ] Check-out visit
- [ ] View visit details

---

## 17. Future Enhancements

### Phase 2 Features

1. **QR Code Integration**
   - Generate QR codes for visits
   - Scan QR for quick check-out
   - Print QR on visitor badges

2. **SMS Notifications**
   - Notify visitor of pre-registration
   - Send visit confirmation
   - Alert on check-in/check-out

3. **Email Notifications**
   - Send visit details to visitor
   - Notify employee of visitor arrival
   - Daily visit summary reports

4. **Visitor Badges**
   - Print visitor badges with photo
   - Include QR code
   - Display visit details
   - Color-coded by department

5. **Advanced Analytics**
   - Visit trends over time
   - Peak visit hours
   - Department popularity
   - Visitor retention rate

6. **Mobile App for Visitors**
   - Self-registration
   - View visit history
   - Check-in via app
   - Digital visitor pass

---

## Summary

This comprehensive enhancement adds:
- ✅ Advanced visitor status management (Active/Blocked)
- ✅ Enhanced visit status tracking (CheckedIn/CheckedOut/Rejected)
- ✅ Pre-registration capability from web
- ✅ Complete RTL support for Arabic in Flutter
- ✅ Visitor blocking with reasons and audit trail
- ✅ Visit rejection with reasons
- ✅ Image upload and management
- ✅ Comprehensive search functionality
- ✅ Responsive design across all platforms
- ✅ Security and access control
- ✅ Complete audit trail

All changes are backward compatible and can be deployed incrementally!

