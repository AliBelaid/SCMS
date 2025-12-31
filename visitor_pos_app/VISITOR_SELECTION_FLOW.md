# Visitor Selection Flow - User Guide

## New Enhanced Flow for Creating Visits

### Overview
The visitor management system now allows you to search for existing visitors and automatically fill in their information when creating a new visit. This saves time and ensures data consistency.

---

## Step-by-Step Flow

### 1. Start New Visit
Navigate to **New Visit** screen from home

### 2. Search for Existing Visitor (Optional but Recommended)
At the top of the form, you'll see a search card:

```
┌─────────────────────────────────────────┐
│ 🔍 بحث عن زائر                          │
│ ابحث عن زائر سابق لتعبئة البيانات تلقائياً │
│                                      → │
└─────────────────────────────────────────┘
```

**Tap this card** to search for existing visitors

### 3. Search Screen
Enter visitor information to search:
- **Name** (الاسم)
- **National ID** (رقم الهوية)
- **Phone** (الهاتف)
- **Company** (الشركة)

The search works with partial matches - just type a few characters!

### 4. Select Visitor
Two options for each visitor in search results:

#### Option A: Select for New Visit
**Tap the visitor card** → Returns to New Visit screen with all data filled:
- ✅ Full Name (الاسم الكامل)
- ✅ National ID (رقم الهوية)
- ✅ Phone (الهاتف)
- ✅ Company (الشركة)
- ✅ Person Image (if available)

#### Option B: View Full Profile
**Tap the info icon (ℹ️)** → Opens visitor profile to see:
- Total visits
- Recent visit history
- All images (person, ID card)
- Block status

### 5. Visitor Found Indicator
After selecting a visitor, you'll see a confirmation card:

```
┌─────────────────────────────────────────┐
│ ✓ الزائر تم العثور عليه                 │
│                                         │
│ [Visitor Photo]                         │
│                                         │
│ عرض الملف الشخصي →                      │
└─────────────────────────────────────────┘
```

**Green border** = Visitor found and active
**Red border** = Visitor is blocked (cannot create visit)

### 6. Complete Visit Information
Fill in the remaining required fields:

#### Visitor Information (already filled if selected)
- ✅ Full Name * (الاسم الكامل)
- ✅ National ID (optional) (رقم الهوية)
- ✅ Phone (optional) (الهاتف)
- ✅ Company (optional) (الشركة)

#### Photos
- Person Photo (صورة شخصية)
- ID Card Photo (صورة بطاقة الهوية)

#### Vehicle Information (Optional)
- Car Plate (رقم اللوحة)
- Car Photo (صورة السيارة)

#### Visit Details *
- Department * (القسم)
- Employee to Visit * (الموظف المراد زيارته)
- Visit Reason (optional) (سبب الزيارة)
- Expected Duration (optional) (المدة المتوقعة)

### 7. Save & Check In
Tap **"حفظ وتسجيل دخول"** to create the visit

---

## Benefits of Using Visitor Search

### 1. **Time Saving**
- No need to re-enter visitor information
- All previous data auto-fills
- Faster check-in process

### 2. **Data Consistency**
- Same visitor = same data across all visits
- No duplicate visitors with slight name variations
- Accurate visitor history tracking

### 3. **Security**
- Immediate notification if visitor is blocked
- Access to visitor's complete history
- Better visitor management

### 4. **Convenience**
- Previous visit details available
- Last department visited shown
- Last employee visited shown

---

## Special Cases

### Case 1: Blocked Visitor
If you select a blocked visitor:

```
┌─────────────────────────────────────────┐
│ ⛔ الزائر محظور                         │
│                                         │
│ Cannot create visit for blocked visitor│
└─────────────────────────────────────────┘
```

**Action**: Contact administrator to unblock visitor

### Case 2: New Visitor (Not in System)
If search returns no results:

1. Close search screen
2. Manually enter visitor information
3. System will create new visitor record
4. Future visits can use search for this visitor

### Case 3: Visitor with Existing Visit
The system allows multiple simultaneous visits for the same visitor (e.g., visiting different departments)

---

## UI Improvements

### Responsive Design
All screens now adapt to your device size:
- **Small phones** (< 5.5"): Optimized layout
- **Medium phones** (5.5" - 6.5"): Balanced spacing
- **Large phones** (> 6.5"): Comfortable viewing
- **Tablets** (7"+): Enhanced layout

### Arabic Language
100% Arabic interface:
- All labels in Arabic (العربية)
- All buttons in Arabic
- All messages in Arabic
- Right-to-Left (RTL) text direction

### Visual Feedback
- **Green** = Success, visitor found, active
- **Red** = Error, blocked, warning
- **Blue** = Information, primary actions
- **Gray** = Secondary, optional

---

## Tips for Best Experience

### 1. Always Search First
Before entering visitor information, search to see if they exist in the system

### 2. Use Partial Search
You don't need to type the full name - a few characters are enough

### 3. Check Visitor Profile
If unsure, tap the info icon to see full visitor history

### 4. Update Photos
Even for existing visitors, you can capture new photos for each visit

### 5. Complete All Required Fields
Fields marked with * are required:
- Full Name *
- Department *
- Employee to Visit *

---

## Troubleshooting

### Search Not Working?
- Check internet connection
- Try searching with different information (name, phone, ID)
- Contact IT support if issue persists

### Visitor Not Found?
- Try different search terms
- Check spelling
- Create as new visitor if truly new

### Cannot Create Visit?
- Check if visitor is blocked (red border)
- Ensure all required fields are filled
- Verify department is selected

---

## API Integration

The visitor selection flow uses these API endpoints:

1. **Search Visitors**: `GET /api/Visitors/search?query={query}`
2. **Lookup Visitor**: `GET /api/Visitors/lookup?nationalId={id}&phone={phone}`
3. **Get Profile**: `GET /api/Visitors/{id}/profile`
4. **Create Visit**: `POST /api/Visits`

All data is synced with the backend in real-time.

---

## Summary

The new visitor selection flow makes creating visits faster, more accurate, and more secure. By searching for existing visitors first, you ensure:

✅ Consistent data
✅ Faster check-in
✅ Better security
✅ Complete history tracking
✅ Reduced errors

**Remember**: Search first, select visitor, complete visit details, save!

