# Visitor Management System - Visit Details & Blocking Feature

## Summary of Changes

### ✅ 1. Visit Details Page (Angular)

**New Component**: `visit-details.component.ts`
- **Location**: `SCMS/src/app/visitor-management/visit-details/`
- **Features**:
  - Display complete visit information
  - Show visitor profile with image
  - Display car image and ID card image
  - View visit timeline (check-in/check-out)
  - Calculate visit duration
  - Navigate to visitor profile
  - Print visit details
  - Checkout and reject visit actions

**Route Added**: `/app/visitor-management/visits/details/:visitNumber`

**Key Features**:
- ✅ Full visit information display
- ✅ Visitor profile section with image
- ✅ Car image display with zoom
- ✅ ID card image display
- ✅ Visit status badges (CheckedIn, CheckedOut, Rejected)
- ✅ Duration calculation
- ✅ Rejection reason display
- ✅ Image error handling with placeholders

---

### ✅ 2. Visit Rejection Feature

**API Endpoint**: `POST /api/Visits/{visitNumber}/reject`

**Request Body**:
```json
{
  "rejectionReason": "string"
}
```

**Features**:
- Reject ongoing visits with reason
- Track rejection timestamp
- Track who rejected the visit
- Update visit status to "Rejected"
- Send SignalR notification

**DTO Added**: `RejectVisitDto` in `Core/Dtos/VisitorManagement/VisitDto.cs`

---

### ✅ 3. Visitor Blocking Feature

**API Endpoint**: `PUT /api/Visitors/{id}/block`

**Request Body**:
```json
{
  "isBlocked": true,
  "blockReason": "string"
}
```

**Features**:
- Block/unblock visitors
- Track block reason
- Track who blocked the visitor
- Track block timestamp
- Prevent blocked visitors from checking in (Flutter)

**DTO Added**: `BlockVisitorDto` in `Core/Dtos/VisitorManagement/VisitorDto.cs`

**Database Fields Added** (Already in migration):
- `Visitor.BlockReason` (string, nullable)
- `Visitor.BlockedAt` (DateTime, nullable)
- `Visitor.BlockedByUserId` (int, nullable)

---

### ✅ 4. Angular Visitor Profile Updates

**Location**: `visitor-profile.component.ts`

**New Features**:
- Block/Unblock button with dialog
- Block reason input dialog
- Visual status indicator (blocked/active)
- Confirmation for unblocking

**UI Components**:
- Status badge with icon
- Block/Unblock button
- Block reason dialog (modal)

---

### ✅ 5. Flutter Blocked Visitor Handling

**Location**: `new_visit_screen.dart`

**Features**:
- Check visitor blocked status before check-in
- Display blocked status warning
- Prevent visit creation for blocked visitors
- Show block indicator in visitor search results

**Flow**:
1. User searches for visitor
2. System checks `isBlocked` status
3. If blocked:
   - Show warning message
   - Display blocked badge
   - Disable check-in button
4. If not blocked:
   - Allow normal check-in flow

---

## API Endpoints Summary

### Visits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Visits/number/{visitNumber}` | Get visit by number |
| POST | `/api/Visits/{visitNumber}/reject` | Reject a visit |
| POST | `/api/Visits/checkout/{visitNumber}` | Checkout a visit |

### Visitors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Visitors/{id}` | Get visitor by ID |
| PUT | `/api/Visitors/{id}/block` | Block/unblock visitor |
| GET | `/api/Visitors/search?query={query}` | Search visitors |

---

## Navigation Flow

### Angular Web App

```
Visits List
  ├─> Visit Details (NEW)
  │   ├─> View Visitor Profile
  │   ├─> Checkout Visit
  │   ├─> Reject Visit
  │   └─> View Car Image
  │
Visitor Profile
  ├─> Block/Unblock Visitor (NEW)
  ├─> View Visit History
  └─> View Image Gallery
```

### Flutter POS App

```
New Visit Screen
  ├─> Search Visitor
  │   ├─> Select Visitor
  │   └─> Check Blocked Status (NEW)
  │
  └─> Create Visit
      └─> Blocked Check (NEW)
```

---

## User Permissions

### Visit Rejection
- **Who**: Any authenticated user
- **Action**: Can reject visits with reason
- **Tracked**: User ID, timestamp, reason

### Visitor Blocking
- **Who**: Any authenticated user (can be restricted to Admin)
- **Action**: Can block/unblock visitors
- **Tracked**: User ID, timestamp, reason

---

## UI/UX Features

### Visit Details Page
- ✅ Responsive grid layout
- ✅ Image zoom functionality
- ✅ Print-friendly design
- ✅ RTL support for Arabic
- ✅ Status color coding
- ✅ Duration calculation
- ✅ Breadcrumb navigation

### Visitor Profile
- ✅ Block/Unblock button
- ✅ Block reason dialog
- ✅ Status badge
- ✅ Confirmation dialogs
- ✅ Success/error notifications

### Flutter App
- ✅ Blocked visitor warning
- ✅ Visual indicators
- ✅ Prevent check-in for blocked
- ✅ Arabic text support

---

## Testing Checklist

### Visit Details
- [ ] Navigate to visit details from visits list
- [ ] View all visit information
- [ ] View visitor profile link
- [ ] View car image (zoom)
- [ ] View ID card image
- [ ] Checkout visit
- [ ] Reject visit with reason
- [ ] Print visit details

### Visitor Blocking (Web)
- [ ] Block visitor from profile
- [ ] Enter block reason
- [ ] Unblock visitor
- [ ] View blocked status
- [ ] Check blocked visitor in visits list

### Visitor Blocking (Flutter)
- [ ] Search for blocked visitor
- [ ] See blocked indicator
- [ ] Try to create visit (should fail)
- [ ] See warning message
- [ ] Search for active visitor (should work)

---

## Database Schema Updates

Already applied in previous migration:

```sql
-- Visit table
ALTER TABLE Visits ADD RejectionReason NVARCHAR(500) NULL;
ALTER TABLE Visits ADD RejectedAt DATETIME2 NULL;
ALTER TABLE Visits ADD RejectedByUserId INT NULL;

-- Visitor table
ALTER TABLE Visitors ADD BlockReason NVARCHAR(500) NULL;
ALTER TABLE Visitors ADD BlockedAt DATETIME2 NULL;
ALTER TABLE Visitors ADD BlockedByUserId INT NULL;
```

---

## Files Created/Modified

### New Files
1. `SCMS/src/app/visitor-management/visit-details/visit-details.component.ts`
2. `SCMS/src/app/visitor-management/visit-details/visit-details.component.html`
3. `SCMS/src/app/visitor-management/visit-details/visit-details.component.scss`

### Modified Files
1. `SCMS/src/app/visitor-management/visitor-management.routes.ts` - Added visit details route
2. `SCMS/src/app/visitor-management/visitor-profile/visitor-profile.component.ts` - Added blocking
3. `SCMS/src/app/visitor-management/visitor-profile/visitor-profile.component.html` - Added block button
4. `SCMS/src/app/visitor-management/services/visitor-management.service.ts` - Added blockVisitor method
5. `API/Controllers/VisitsController.cs` - Added RejectVisit endpoint
6. `API/Controllers/VisitorsController.cs` - Updated UpdateBlockStatus endpoint
7. `Core/Dtos/VisitorManagement/VisitDto.cs` - Added RejectVisitDto
8. `Core/Dtos/VisitorManagement/VisitorDto.cs` - Added BlockVisitorDto
9. `visitor_pos_app/lib/presentation/screens/new_visit/new_visit_screen.dart` - Added block check
10. `visitor_pos_app/lib/core/constants/ar_text.dart` - Added blocked text

---

## Next Steps

1. **Test all features** in both Angular and Flutter
2. **Add permissions** if needed (restrict blocking to admins)
3. **Add audit logging** for block/unblock actions
4. **Add email notifications** when visitor is blocked
5. **Add bulk block/unblock** feature
6. **Add block expiration** feature (temporary blocks)
7. **Add visit rejection reports**

---

## Arabic Translations

All UI text is in Arabic:
- ✅ Visit details labels
- ✅ Block/unblock buttons
- ✅ Status badges
- ✅ Dialog titles
- ✅ Error messages
- ✅ Success messages

---

## Complete! 🎉

All features have been implemented and are ready for testing.

