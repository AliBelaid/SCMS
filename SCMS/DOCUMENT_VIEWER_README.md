# Document Viewer System - Angular Frontend

A complete Angular-based document viewer system with role-based access control, real-time notifications, and secure file management.

## 🌟 Features

### 🔐 Authentication System
- **Code + Password Login**: Users authenticate using unique codes and passwords
- **Role-based Access**: Admin and Member roles with different permissions
- **Session Management**: Persistent login state with localStorage
- **Account Status**: Active/Inactive user accounts

### 📁 File Management
- **File Upload**: Admin can upload documents with permission settings
- **Permission Control**: Granular access control with allowed/excluded users
- **File Types**: Support for PDF, Word, Excel, and Image files
- **File Preview**: Modal-based file preview system
- **Mock Download**: Simulated file download functionality

### 👥 User Management (Admin Only)
- **User Creation**: Add new users with codes, passwords, and roles
- **User Activation**: Activate/deactivate user accounts
- **Password Reset**: Generate random passwords for users
- **User Deletion**: Remove users with confirmation dialogs

### 🔔 Real-time Notifications
- **Mock SignalR**: Simulated real-time notifications
- **File Upload Alerts**: Notify users when new files are uploaded
- **Snackbar Notifications**: User-friendly feedback messages

### 🎨 Modern UI
- **Angular Material**: Professional Material Design components
- **Responsive Design**: Mobile-friendly interface
- **Role-based Navigation**: Different layouts for Admin and Member users
- **Interactive Tables**: Sortable and filterable data tables

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (v17 or higher)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   ng serve
   ```
4. Open `http://localhost:4200` in your browser

## 👤 Demo Credentials

### Admin Access
- **Code**: `ADMIN001`
- **Password**: `admin123`
- **Description**: System Administrator

### Member Access
- **Code**: `MEMBER001`
- **Password**: `member123`
- **Description**: John Doe - Marketing Team

### Additional Test Users
- **Code**: `MEMBER002`
- **Password**: `member456`
- **Description**: Jane Smith - Sales Team

- **Code**: `MEMBER003`
- **Password**: `member789`
- **Description**: Bob Johnson - IT Team (Inactive)

## 📋 System Architecture

### Models
- `AppUser`: User interface with code, password, role, and status
- `FileEntry`: File interface with permissions and metadata

### Services
- `AuthService`: Authentication and session management
- `FileService`: File operations and permission checking
- `UserService`: User management operations
- `FakeDatabaseService`: Mock data storage
- `SignalRService`: Real-time notifications (mocked)

### Components
- `LoginComponent`: Authentication interface
- `FileTableComponent`: Document library display
- `FileUploadComponent`: Admin file upload interface
- `UserPanelComponent`: User management interface
- `FilePreviewDialogComponent`: File preview modal
- `ConfirmDialogComponent`: Confirmation dialogs

### Guards
- `AuthGuard`: Protects routes requiring authentication
- `AdminGuard`: Protects admin-only routes

### Pipes
- `RolePipe`: Converts role values to display text
- `FileIconPipe`: Maps file types to Material icons

## 🔧 Key Features Explained

### Permission System
Files have two permission arrays:
- `allowedUsers`: Array of user codes who can access the file
- `excludedUsers`: Array of user codes explicitly blocked from access

A user can access a file if:
1. Their code is in `allowedUsers` AND
2. Their code is NOT in `excludedUsers`

### Real-time Updates
The system uses a mock SignalR service that:
- Simulates real-time file upload notifications
- Automatically refreshes file lists when new files are added
- Shows snackbar notifications to users

### Mock Data
The system includes pre-populated mock data:
- 4 test users (1 admin, 3 members)
- 4 sample files with different permission settings
- Realistic file metadata and descriptions

## 🎯 Usage Scenarios

### For Admins
1. **Login** with admin credentials
2. **Upload Files** with specific user permissions
3. **Manage Users** - create, activate, deactivate, delete
4. **View All Files** in the system
5. **Reset Passwords** for users

### For Members
1. **Login** with member credentials
2. **View Authorized Files** only
3. **Preview Files** in modal dialogs
4. **Download Files** (mock functionality)
5. **Receive Notifications** when new files are uploaded

## 🔒 Security Features

- **Route Guards**: Protected routes based on authentication and roles
- **Permission Validation**: Server-side permission checking
- **Session Management**: Secure login state handling
- **Input Validation**: Form validation and error handling
- **Confirmation Dialogs**: Safe deletion and critical operations

## 📱 Responsive Design

The system is fully responsive with:
- Mobile-friendly navigation
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements
- Optimized table displays for mobile devices

## 🎨 Customization

### Styling
- Uses Angular Material theming
- Custom CSS classes for consistent styling
- Responsive design patterns
- Error state styling for better UX

### Adding New Features
- Modular component architecture
- Service-based data management
- Easy to extend with new file types
- Scalable permission system

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Environment Configuration
- Update API endpoints in services
- Configure real SignalR connection
- Set up proper authentication backend
- Configure file storage system

## 📝 Notes

- This is a **frontend-only** implementation with mock data
- All file operations are simulated
- Real-time notifications use mock SignalR
- No actual file storage or backend integration
- Perfect for prototyping and demonstration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Document Viewer System** - A secure, role-based document management solution built with Angular and Material Design. 