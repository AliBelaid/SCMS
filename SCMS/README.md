# Health Expense Management System (HEMS) - Frontend

A comprehensive Angular-based frontend application for managing health insurance claims, subscriber benefits, provider networks, and administrative operations.

## 🎯 System Overview

HEMS-FE is a complete health insurance management platform built with Angular 17+ and Angular Material, providing role-based interfaces for:

- **TPA Administrators**: Complete claims processing, batch management, contract administration
- **Insurance Companies**: Claims review, contract management, subscriber oversight
- **Healthcare Providers**: Claim submission, pre-approval requests, eligibility verification
- **Subscribers**: Personal claims tracking, benefits management, document access

## 🏗️ Architecture

### Technology Stack
- **Framework**: Angular 17+ with Standalone Components
- **UI Library**: Angular Material 17 (Material Design 3)
- **Styling**: SCSS with responsive design
- **Charts**: Chart.js for analytics and reporting
- **Icons**: Material Icons
- **HTTP Client**: Angular HTTP Client with interceptors
- **Routing**: Angular Router with lazy loading
- **Forms**: Reactive Forms with comprehensive validation

### Project Structure
```
HEMS-FE/
├── src/
│   ├── app/
│   │   ├── insurance/
│   │   │   ├── tpa-admin/           # TPA Administration Module
│   │   │   ├── insurance-company/   # Insurance Company Module
│   │   │   ├── provider/           # Healthcare Provider Module
│   │   │   └── subscriber/         # Subscriber Portal Module
│   │   ├── user/                   # User Management Module
│   │   ├── services/               # Shared Services
│   │   ├── guards/                 # Route Guards
│   │   ├── interceptors/           # HTTP Interceptors
│   │   └── shared/                 # Shared Components
│   ├── assets/                     # Static Assets
│   └── styles/                     # Global Styles
```

## 📱 Module Overview

### 1. TPA Admin Module (`/tpa-admin`)
**Complete administrative control over the insurance ecosystem**

**Dashboard**
- Real-time claims statistics and KPIs
- Interactive Chart.js visualizations
- Recent claims table with sorting/filtering
- Quick action buttons for common tasks

**Claims Management**
- Claims List: Comprehensive claims overview with advanced filtering
- Pending Claims: Priority-based claim queue management
- Process Claims: Detailed claim review and decision workflow
- Claim Details: Complete claim information and history

**Pre-Approvals**
- Pre-approval request management
- Automated approval workflows
- Medical necessity verification

**Batch Management**
- Batch creation and processing
- Voucher generation and management
- Payment reconciliation

**Network Management**
- Provider registration and verification
- Contract management and renewal
- Performance monitoring

**Subscriber Management**
- Member enrollment and verification
- Benefit plan assignment
- Dependent management

**Reporting & Analytics**
- Claims analytics and trends
- Financial reporting
- Provider performance metrics
- Subscriber utilization reports

### 2. Insurance Company Module (`/insurance-company`)
**Contract and claims oversight capabilities**

**Dashboard**
- Contract performance metrics
- Claims review queue
- Financial summaries

**Claims Review**
- Pending review queue
- Reviewed claims history
- Detailed claim analysis

**Contract Management**
- Active contracts overview
- Expiring contracts alerts
- Contract performance tracking

**Subscriber Analytics**
- Member demographics
- Utilization patterns
- Cost analysis

### 3. Provider Module (`/provider`)
**Healthcare provider claim submission and management**

**Dashboard**
- Submission statistics
- Revenue tracking
- Approval rates and trends

**Claims Management**
- New claim submission with file uploads
- My claims tracking and status
- Claim editing and resubmission

**Pre-Approvals**
- Pre-approval request submission
- Request tracking and status
- Medical documentation upload

**Eligibility Verification**
- Real-time subscriber eligibility checks
- Benefit verification
- Coverage limitations

**Batch Operations**
- Batch claim submissions
- Payment tracking
- Reconciliation reports

### 4. Subscriber Portal (`/subscriber`)
**Self-service portal for insurance members**

**Dashboard**
- Personal claims summary
- Benefits utilization overview
- Quick actions and notifications

**Claims Tracking**
- My claims history
- Claim status updates
- Document uploads

**Benefits Information**
- Coverage details
- Benefit limits and usage
- Plan information

**Pre-Approvals**
- Request submissions
- Status tracking
- Required documentation

**Dependents Management**
- Add/edit dependents
- Dependent claims
- Family coverage overview

**Documents**
- Insurance documents
- Claims documentation
- ID card downloads

**Digital ID Card**
- Interactive digital insurance card
- QR code for verification
- Download and sharing options

### 5. User Management Module (`/user`)
**Comprehensive user profile and account management**

**User Profile**
- Personal information management
- Contact details and emergency contacts
- Profile image upload
- Multi-section form with validation

**Change Password**
- Secure password change workflow
- Password strength validation
- Security requirements compliance
- Real-time strength indicator

**Notifications**
- Notification center with filtering
- Comprehensive notification settings
- Email, SMS, and push preferences
- Quiet hours configuration

## 🔐 Security & Access Control

### Authentication System
- JWT-based authentication with refresh tokens
- Automatic token refresh handling
- Secure session management
- Multi-factor authentication support

### Role-Based Access Control (RBAC)
- Fine-grained permission system
- Role hierarchy with levels
- Route-level protection
- Component-level access control

### Security Features
- HTTP interceptors for authentication
- Error handling and logging
- CSRF protection
- Input validation and sanitization

## 🎨 User Interface

### Design System
- Material Design 3 principles
- Consistent color palette and typography
- Responsive design for all screen sizes
- Accessibility compliance (WCAG 2.1)

### Component Architecture
- Standalone Angular components
- Reusable UI components
- Consistent layout patterns
- Interactive data tables with sorting/filtering

### User Experience
- Intuitive navigation structure
- Progressive loading with skeletons
- Real-time feedback and notifications
- Mobile-first responsive design

## 🔧 Technical Features

### Performance Optimizations
- Lazy loading modules
- OnPush change detection
- Image optimization
- Bundle size optimization

### API Integration
- RESTful API communication
- Comprehensive error handling
- Loading states management
- Offline support preparation

### Data Management
- Reactive data flows with RxJS
- State management patterns
- Real-time updates
- Caching strategies

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 17+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd HEMS-FE

# Install dependencies
npm install

# Start development server
ng serve

# Navigate to http://localhost:4200
```

### Build for Production
```bash
# Production build
ng build --configuration production

# Build with specific environment
ng build --configuration staging
```

## 📊 Features Implemented

### ✅ Core Modules
- [x] TPA Admin Dashboard with analytics
- [x] Claims management workflow
- [x] Provider portal with submission capabilities
- [x] Subscriber self-service portal
- [x] User management and profiles

### ✅ Technical Infrastructure
- [x] Role-based authentication system
- [x] HTTP interceptors for auth and error handling
- [x] Route guards for access control
- [x] Responsive Material Design UI
- [x] Chart.js integration for analytics

### ✅ User Experience
- [x] Comprehensive form validation
- [x] File upload capabilities
- [x] Interactive data tables
- [x] Real-time notifications
- [x] Mobile-responsive design

## 🎯 System Capabilities

### For TPA Administrators
- Complete claims processing workflow
- Batch management and voucher generation
- Provider network administration
- Subscriber lifecycle management
- Comprehensive reporting and analytics

### For Insurance Companies
- Claims review and approval workflows
- Contract performance monitoring
- Subscriber analytics and reporting
- Financial oversight and controls

### For Healthcare Providers
- Streamlined claim submission process
- Pre-approval request management
- Real-time eligibility verification
- Revenue tracking and reporting

### For Subscribers
- Personal claims tracking
- Benefits information access
- Digital ID card management
- Document storage and access
- Family member management

## 🔒 Security Measures

- JWT token-based authentication
- Role-based access control
- HTTP-only cookie support
- CSRF protection
- Input validation and sanitization
- Secure file upload handling
- Session timeout management

## 📱 Responsive Design

- Mobile-first approach
- Tablet-optimized layouts
- Desktop enhanced experience
- Touch-friendly interactions
- Optimized for all screen sizes

## 🛠️ Development Guidelines

### Code Organization
- Feature-based module structure
- Consistent naming conventions
- Comprehensive TypeScript interfaces
- Reactive programming patterns

### Testing Strategy
- Unit tests for components and services
- Integration tests for workflows
- E2E tests for critical paths
- Accessibility testing

### Performance Standards
- Lazy loading implementation
- Optimized bundle sizes
- Image compression and optimization
- Efficient change detection

## 📈 Analytics & Reporting

- Real-time dashboard metrics
- Interactive Chart.js visualizations
- Export capabilities (CSV, Excel)
- Custom report generation
- Performance tracking

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 API Integration

The frontend is designed to integrate with a RESTful API backend with the following endpoints:

- Authentication: `/api/auth/*`
- Claims: `/api/claims/*`
- Users: `/api/users/*`
- Providers: `/api/providers/*`
- Subscribers: `/api/subscribers/*`
- Reports: `/api/reports/*`

## 🎉 Project Status

**COMPLETED** ✅ - All major modules and features have been implemented including:

- Complete TPA Admin module with dashboard and all sub-components
- Insurance Company module with claims review and contract management
- Provider module with claim submission and management capabilities
- Subscriber portal with self-service features
- User management with profile, password, and notification settings
- Comprehensive authentication and authorization system
- Shared services for API communication
- Security guards and interceptors
- Responsive Material Design UI throughout

The Health Expense Management System frontend is now feature-complete and ready for integration with backend services and deployment. 