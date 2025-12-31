# Offline Mode Implementation

## Overview

The Visitor POS App now supports **offline mode** using SQLite local database. When internet is not available, visitor data is saved locally and automatically synced when connectivity is restored.

## Features

### ✅ Offline Storage
- All visitor visits are saved to SQLite database when offline
- Data persists across app restarts
- No data loss when internet connection is unavailable

### ✅ Automatic Sync
- Automatically syncs pending visits when internet connection is restored
- Background sync runs when connectivity changes
- Manual sync button available on home screen

### ✅ Offline Indicators
- Visual indicators show when app is offline
- Pending sync count displayed on home screen
- Success messages indicate when visits are saved offline

### ✅ Cached Data
- Recently synced visits are cached for offline viewing
- Active visits list works offline using cached data
- Search functionality works with cached data

## How It Works

### 1. Creating Visits Offline

When a visit is created without internet:
1. Visit data is saved to local SQLite database (`pending_visits` table)
2. A temporary visit number is generated (format: `OFFLINE-{timestamp}`)
3. User sees success message with "Saved Offline" indicator
4. Visit appears in active visits list with offline status

### 2. Automatic Sync

When internet connection is restored:
1. App detects connectivity change
2. Automatically attempts to sync all pending visits
3. Successfully synced visits are removed from pending queue
4. Synced visits are cached for future offline viewing

### 3. Manual Sync

Users can manually trigger sync:
1. Tap sync button on home screen (when online)
2. All pending visits are sent to server
3. Success/failure message is displayed

## Database Schema

### `pending_visits` Table
- `id`: Primary key
- `visit_data`: JSON string of visit data
- `created_at`: Timestamp when saved
- `sync_status`: 'pending' or 'synced'

### `cached_visits` Table
- `id`: Primary key
- `visit_number`: Unique visit number
- `visit_data`: JSON string of visit data
- `updated_at`: Last update timestamp

## Usage

### For Users

1. **Creating visits offline**: Just create visits normally - they'll be saved automatically
2. **Checking sync status**: Look at home screen for pending sync count
3. **Manual sync**: Tap sync button when online to sync immediately
4. **Viewing offline visits**: Offline visits appear in active visits list

### For Developers

#### Check Connectivity
```dart
final connectivityService = ConnectivityService();
final isOnline = await connectivityService.isOnline();
```

#### Save Visit Offline
```dart
final localDb = LocalDatabase();
await localDb.savePendingVisit(visitData);
```

#### Sync Pending Visits
```dart
final syncService = VisitsSyncService(visitsApi);
final result = await syncService.syncPendingVisits();
```

#### Get Pending Count
```dart
final localDb = LocalDatabase();
final count = await localDb.getPendingVisitsCount();
```

## Technical Details

### Dependencies Added
- `sqflite: ^2.3.0` - SQLite database
- `connectivity_plus: ^5.0.2` - Connectivity checking

### Files Created
- `lib/data/services/local_database.dart` - SQLite database operations
- `lib/data/services/visits_sync_service.dart` - Sync service
- `lib/core/utils/connectivity_service.dart` - Connectivity checking

### Files Modified
- `lib/data/services/visits_api.dart` - Added offline support
- `lib/presentation/screens/new_visit/new_visit_screen.dart` - Offline indicators
- `lib/presentation/screens/home/home_screen.dart` - Sync UI
- `lib/main.dart` - Auto-sync initialization

## Notes

- Offline visits have negative IDs (e.g., -1, -2) to distinguish from server-synced visits
- Visit numbers for offline visits follow format: `OFFLINE-{timestamp}`
- Cached visits are automatically cleaned up after 7 days
- Sync happens automatically but can also be triggered manually
- All image data (base64) is stored in the database for offline visits

## Testing Offline Mode

1. **Enable Airplane Mode** on your device
2. **Create a visit** - should save offline
3. **Check home screen** - should show pending sync count
4. **Disable Airplane Mode** - should auto-sync
5. **Check active visits** - offline visit should now be synced

