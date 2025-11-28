# Breadcrumb Navigation Component

Beautiful breadcrumb navigation with back button functionality for all pages.

## Features
- 🎨 Beautiful gradient design with multiple themes
- ⬅️ Back button to return to previous page
- 🔗 Clickable breadcrumb trail
- 📱 Fully responsive
- 🎯 Icons support
- 💫 Smooth animations
- 🌈 Multiple color themes

## Usage

### 1. Add to Component Template

Simply add the component to the top of your page:

```html
<!-- Add at the top of your component HTML -->
<app-breadcrumb></app-breadcrumb>

<!-- Your existing content -->
<div class="your-content">
  ...
</div>
```

### 2. Set Breadcrumbs in Component TypeScript

```typescript
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';

export class YourComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    // Option 1: Use helper methods for common patterns
    this.breadcrumbService.buildCorporateClientBreadcrumbs(
      this.clientId,
      this.clientName,
      [
        { label: 'Contracts', url: `/app/corporate-clients/${this.clientId}/contracts`, icon: 'description' }
      ]
    );

    // Option 2: Set custom breadcrumbs
    this.breadcrumbService.setBreadcrumbs([
      { label: 'Home', url: '/app', icon: 'home' },
      { label: 'Corporate Clients', url: '/app/corporate-clients', icon: 'business' },
      { label: 'Client Name', url: `/app/corporate-clients/1`, icon: 'account_balance' },
      { label: 'Current Page', url: '/current', icon: 'description' }
    ]);
  }
}
```

### 3. Examples for Different Pages

#### Corporate Client Profile
```typescript
ngOnInit(): void {
  this.breadcrumbService.buildCorporateClientBreadcrumbs(
    this.clientId,
    this.client.name
  );
}
```

#### Contract Details
```typescript
ngOnInit(): void {
  this.breadcrumbService.buildContractBreadcrumbs(
    this.clientId,
    this.clientName,
    this.contractId,
    this.contract.contractName
  );
}
```

#### Subscriber Management
```typescript
ngOnInit(): void {
  this.breadcrumbService.buildContractBreadcrumbs(
    this.clientId,
    this.clientName,
    this.contractId,
    this.contractName,
    [{ label: 'Subscribers', url: '#', icon: 'people' }]
  );
}
```

#### Card Management
```typescript
ngOnInit(): void {
  this.breadcrumbService.buildContractBreadcrumbs(
    this.clientId,
    this.clientName,
    this.contractId,
    this.contractName,
    [
      { label: 'Subscribers', url: `/app/corporate-clients/${this.clientId}/contracts/${this.contractId}/subscribers`, icon: 'people' },
      { label: 'Card Management', url: '#', icon: 'credit_card' }
    ]
  );
}
```

#### Medical Provider Batches
```typescript
ngOnInit(): void {
  this.breadcrumbService.buildMedicalProviderBreadcrumbs(
    this.providerId,
    this.providerName,
    [{ label: 'Batches', url: '#', icon: 'layers' }]
  );
}
```

## Color Themes

Change the theme by adding a class to the breadcrumb component in your HTML:

```html
<!-- Default purple gradient -->
<app-breadcrumb></app-breadcrumb>

<!-- Blue theme -->
<app-breadcrumb class="theme-blue"></app-breadcrumb>

<!-- Green theme -->
<app-breadcrumb class="theme-green"></app-breadcrumb>

<!-- Orange theme -->
<app-breadcrumb class="theme-orange"></app-breadcrumb>

<!-- Corporate dark theme -->
<app-breadcrumb class="theme-corporate"></app-breadcrumb>
```

## Integration Examples

### Full Example - Card Management Component

```typescript
import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-card-management',
  standalone: true,
  imports: [
    // ... your existing imports
    BreadcrumbComponent  // Add this
  ],
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.scss']
})
export class CardManagementComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    // ... your other services
  ) {}

  ngOnInit(): void {
    // Set breadcrumbs
    this.breadcrumbService.buildContractBreadcrumbs(
      this.clientId,
      this.clientName,
      this.contractId,
      this.contractName,
      [
        { 
          label: 'Subscribers', 
          url: `/app/corporate-clients/${this.clientId}/contracts/${this.contractId}/subscribers`, 
          icon: 'people' 
        },
        { 
          label: `Card - ${this.subscriber?.firstName} ${this.subscriber?.lastName}`, 
          url: '#', 
          icon: 'credit_card' 
        }
      ]
    );

    // ... rest of your initialization
  }
}
```

Then in your HTML template:

```html
<!-- card-management.component.html -->
<app-breadcrumb></app-breadcrumb>

<!-- Your existing content below -->
<div class="card-management-container">
  ...
</div>
```

## API Reference

### BreadcrumbService Methods

- `setBreadcrumbs(breadcrumbs: Breadcrumb[])` - Set custom breadcrumbs
- `addBreadcrumb(breadcrumb: Breadcrumb)` - Add single breadcrumb
- `clearBreadcrumbs()` - Clear all breadcrumbs
- `getBreadcrumbs()` - Get current breadcrumbs
- `buildCorporateClientBreadcrumbs(...)` - Helper for corporate client pages
- `buildContractBreadcrumbs(...)` - Helper for contract pages
- `buildMedicalProviderBreadcrumbs(...)` - Helper for provider pages

### Breadcrumb Interface

```typescript
interface Breadcrumb {
  label: string;      // Display text
  url: string;        // Navigation URL
  icon?: string;      // Material icon name (optional)
  queryParams?: any;  // Query parameters (optional)
}
```

## Styling

The breadcrumb is fully styled and responsive. No additional CSS needed in your components!

- Gradient background with smooth animations
- Hover effects on clickable items
- Responsive design for mobile
- Dark theme support
- Multiple color themes available

