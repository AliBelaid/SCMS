# Navigation Updates - Visitor Management

## Overview
Added complete navigation structure for the Visitor Management module with all routes and translation keys.

---

## Changes Made

### 1. Navigation Config Service (`navigation-config.service.ts`)

#### Added Visitors Dropdown Menu
```typescript
{
  type: 'dropdown',
  label: this.translate.instant('VISITORS') || 'Visitors',
  icon: 'mat:people',
  children: [
    {
      type: 'link',
      label: this.translate.instant('ALL_VISITORS') || 'All Visitors',
      route: '/app/visitor-management/visitors/list',
      icon: 'mat:list'
    },
    {
      type: 'link',
      label: this.translate.instant('VISITOR_PROFILES') || 'Visitor Profiles',
      route: '/app/visitor-management/visitors',
      icon: 'mat:account_box'
    }
  ]
}
```

#### Updated Visits Icon
Changed from `mat:people` to `mat:event_available` for better visual distinction between Visits and Visitors.

---

### 2. Arabic Translations (`ar.json`)

Added 45+ new translation keys for visitor management:

#### Navigation Keys
- `VISITOR_MANAGEMENT`: "إدارة الزوار"
- `VISITORS`: "الزوار"
- `ALL_VISITORS`: "جميع الزوار"
- `VISITOR_PROFILES`: "ملفات الزوار"
- `VISITOR_LIST`: "قائمة الزوار"
- `VISITOR_PROFILE`: "ملف الزائر"

#### Visitor Information Keys
- `VISITOR_INFORMATION`: "معلومات الزائر"
- `VISITOR_NAME`: "اسم الزائر"
- `VISITOR_PHONE`: "هاتف الزائر"
- `VISITOR_COMPANY`: "شركة الزائر"
- `VISITOR_NATIONAL_ID`: "رقم هوية الزائر"
- `VISITOR_STATUS`: "حالة الزائر"
- `VISITOR_BLOCKED`: "زائر محظور"
- `VISITOR_ACTIVE`: "زائر نشط"

#### Visit Statistics Keys
- `TOTAL_VISITS`: "إجمالي الزيارات"
- `LAST_VISIT_DATE`: "تاريخ آخر زيارة"

#### Action Keys
- `VIEW_VISITOR_PROFILE`: "عرض ملف الزائر"
- `VIEW_VISIT_HISTORY`: "عرض سجل الزيارات"
- `SEARCH_VISITORS`: "بحث عن زوار"
- `FILTER_BY_DEPARTMENT`: "تصفية حسب القسم"
- `CLEAR_FILTERS`: "مسح التصفية"

#### Status Keys
- `NO_VISITORS_FOUND`: "لم يتم العثور على زوار"
- `LOADING_VISITORS`: "جاري تحميل الزوار"

#### Visit Details Keys
- `VISITOR_DETAILS`: "تفاصيل الزائر"
- `VISIT_DETAILS`: "تفاصيل الزيارة"
- `VISIT_NUMBER`: "رقم الزيارة"
- `VISIT_DATE`: "تاريخ الزيارة"
- `VISIT_TIME`: "وقت الزيارة"
- `VISIT_PURPOSE`: "غرض الزيارة"
- `VISIT_STATUS`: "حالة الزيارة"
- `CHECK_IN_TIME`: "وقت الدخول"
- `CHECK_OUT_TIME`: "وقت الخروج"
- `DEPARTMENT_VISITED`: "القسم المزار"
- `EMPLOYEE_VISITED`: "الموظف المزار"

#### Image Keys
- `VISITOR_IMAGE`: "صورة الزائر"
- `ID_CARD_IMAGE`: "صورة بطاقة الهوية"
- `CAR_PLATE`: "رقم اللوحة"
- `CAR_IMAGE`: "صورة السيارة"

---

## Complete Navigation Structure

### Visitor Management Section
```
📊 Visitor Management (إدارة الزوار)
├── 📈 Dashboard (لوحة تحكم الزوار)
│   └── /app/visitor-management/dashboard
│
├── 📅 Visits (الزيارات)
│   ├── ⏰ Active Visits (الزيارات النشطة)
│   │   └── /app/visitor-management/visits/active
│   └── 🚪 Check In Visitor (تسجيل دخول زائر)
│       └── /app/visitor-management/visits/checkin
│
├── 👥 Visitors (الزوار)
│   ├── 📋 All Visitors (جميع الزوار)
│   │   └── /app/visitor-management/visitors/list
│   └── 👤 Visitor Profiles (ملفات الزوار)
│       └── /app/visitor-management/visitors
│
└── 📊 Reports (تقارير الزيارات)
    └── /app/visitor-management/reports
```

---

## Routes Configuration

### Main Routes (`app.routes.ts`)
- Root redirect to `/app/visitor-management` for authenticated users
- Login redirect for unauthenticated users

### Visitor Management Routes (`visitor-management.routes.ts`)
```typescript
/app/visitor-management
├── /dashboard                          → Visitor Dashboard
├── /visits
│   ├── /active                        → Active Visits List
│   ├── /checkin                       → Check In Visitor
│   └── /checkout/:visitNumber         → Check Out Visitor
├── /visitors
│   ├── /list                          → All Visitors List
│   └── /profile/:id                   → Visitor Profile Detail
└── /reports                           → Visit Reports
```

---

## Component Integration

### Visitors List Component
**Route**: `/app/visitor-management/visitors/list`

**Features**:
- Search by name, national ID, phone, company
- Filter by department
- Sort by any column
- Pagination (10, 25, 50, 100 items per page)
- View visitor profile
- View visit history
- Status indicators (Active/Blocked)

**Columns**:
1. Profile Image
2. Full Name
3. National ID
4. Phone
5. Company
6. Total Visits
7. Last Visit Date
8. Status
9. Actions

### Visitor Profile Component
**Route**: `/app/visitor-management/visitors/profile/:id`

**Features**:
- Personal information display
- Visit statistics
- Recent visits history
- Image gallery (person, ID card, car)
- Block/Unblock visitor (Admin only)
- Create new visit for visitor

---

## Icons Used

| Icon | Usage | Material Icon |
|------|-------|---------------|
| 📊 | Dashboard | `mat:dashboard` |
| 📅 | Visits (dropdown) | `mat:event_available` |
| ⏰ | Active Visits | `mat:access_time` |
| 🚪 | Check In | `mat:login` |
| 👥 | Visitors (dropdown) | `mat:people` |
| 📋 | All Visitors | `mat:list` |
| 👤 | Visitor Profiles | `mat:account_box` |
| 📊 | Reports | `mat:assessment` |

---

## Usage Examples

### In HTML Templates
```html
<!-- Using translation keys -->
<h1>{{ 'VISITORS' | translate }}</h1>
<p>{{ 'TOTAL_VISITS' | translate }}: {{ visitor.totalVisits }}</p>
<button>{{ 'VIEW_VISITOR_PROFILE' | translate }}</button>
```

### In TypeScript Components
```typescript
import { TranslateService } from '@ngx-translate/core';

constructor(private translate: TranslateService) {}

showMessage() {
  const message = this.translate.instant('NO_VISITORS_FOUND');
  console.log(message); // Output: "لم يتم العثور على زوار"
}
```

### In Navigation Config
```typescript
{
  type: 'link',
  label: this.translate.instant('ALL_VISITORS') || 'All Visitors',
  route: '/app/visitor-management/visitors/list',
  icon: 'mat:list'
}
```

---

## Testing Checklist

### Navigation
- [ ] Visitor Management section appears in sidebar
- [ ] All menu items are clickable
- [ ] Icons display correctly
- [ ] Arabic translations show properly
- [ ] Routes navigate to correct components

### Visitors List
- [ ] List loads all visitors
- [ ] Search functionality works
- [ ] Department filter works
- [ ] Sorting works on all columns
- [ ] Pagination works correctly
- [ ] View profile button navigates correctly
- [ ] View history button navigates correctly
- [ ] Status chips display correctly

### Visitor Profile
- [ ] Profile loads visitor data
- [ ] Statistics display correctly
- [ ] Recent visits show properly
- [ ] Images load correctly
- [ ] Block/Unblock works (Admin only)
- [ ] Create visit button works

### Translations
- [ ] All labels in Arabic
- [ ] All buttons in Arabic
- [ ] All messages in Arabic
- [ ] All tooltips in Arabic

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/Visitors` | GET | Get all visitors with optional filters |
| `/api/Visitors/{id}/profile` | GET | Get detailed visitor profile |
| `/api/Visitors/search?query={q}` | GET | Search visitors |
| `/api/Visitors/{id}/block` | PUT | Block/Unblock visitor |
| `/api/Departments` | GET | Get departments for filtering |

---

## Files Modified

1. **`SCMS/src/app/core/navigation/navigation-config.service.ts`**
   - Added Visitors dropdown menu
   - Updated Visits icon
   - Added proper routing

2. **`SCMS/src/assets/i18n/ar.json`**
   - Added 45+ new translation keys
   - Organized by category
   - Complete Arabic translations

---

## Benefits

### For Users
✅ Easy access to visitor management features
✅ Clear navigation structure
✅ Full Arabic language support
✅ Intuitive icons and labels

### For Developers
✅ Consistent routing structure
✅ Reusable translation keys
✅ Type-safe navigation config
✅ Easy to extend and maintain

### For Administrators
✅ Complete visitor tracking
✅ Quick access to visitor profiles
✅ Easy filtering and searching
✅ Comprehensive reporting

---

## Future Enhancements

1. **Visitor Categories**: Add visitor type classification (VIP, Regular, Contractor)
2. **Visitor Badges**: Print visitor badges with QR codes
3. **Visitor Pre-registration**: Allow visitors to pre-register online
4. **Visitor Notifications**: SMS/Email notifications for visitors
5. **Visitor Analytics**: Advanced analytics and insights
6. **Visitor Feedback**: Collect visitor feedback after visits
7. **Visitor Blacklist**: Enhanced security with blacklist management
8. **Visitor Groups**: Manage group visits
9. **Visitor Appointments**: Schedule visitor appointments
10. **Visitor Check-in Kiosk**: Self-service check-in kiosk

---

## Summary

The navigation structure is now complete with:
- ✅ All visitor management routes configured
- ✅ Complete Arabic translations (45+ keys)
- ✅ Proper icons and visual hierarchy
- ✅ Integration with existing components
- ✅ Role-based access control ready
- ✅ Consistent with application architecture

All visitor management features are now easily accessible through the navigation menu with full Arabic language support!

