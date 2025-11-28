import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  children?: NavigationItem[];
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceNavigationService {
  private _navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      route: '/app/insurance/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Companies',
      route: '/app/insurance/insurance-companies',
      icon: 'business',
      children: [
        { 
          label: 'Company List', 
          route: '/app/insurance/insurance-companies' 
        },
        { 
          label: 'Create Company', 
          route: '/app/insurance/insurance-companies/create' 
        }
      ]
    },
    {
      label: 'Claims',
      route: '/app/insurance/claims',
      icon: 'receipt',
      children: [
        { 
          label: 'Claims List', 
          route: '/app/insurance/claims' 
        },
        { 
          label: 'New Claim', 
          route: '/app/insurance/claims/new' 
        }
      ]
    },
    {
      label: 'Contracts',
      route: '/app/insurance/contracts',
      icon: 'assignment',
      children: [
        { 
          label: 'Contracts List', 
          route: '/app/insurance/contracts' 
        },
        { 
          label: 'New Contract', 
          route: '/app/insurance/contracts/new' 
        }
      ]
    },
    {
      label: 'ICD10',
      route: '/app/insurance/icd10/tree',
      icon: 'medical_services',
      children: [
        { 
          label: 'ICD10 List', 
          route: '/app/insurance/icd10/tree' 
        },
        { 
          label: 'Categories', 
          route: '/app/insurance/icd10/categories' 
        },
        { 
          label: 'All Codes', 
          route: '/app/insurance/icd10/list' 
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  getNavigationItems(): NavigationItem[] {
    return this._navigationItems;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]).catch(error => {
      console.error('Navigation error:', error);
      // Optionally show a user-friendly error message
      alert(`Unable to navigate to ${route}. Please try again.`);
    });
  }

  findItemByRoute(route: string): NavigationItem | undefined {
    const findItem = (items: NavigationItem[]): NavigationItem | undefined => {
      for (const item of items) {
        if (item.route === route) return item;
        if (item.children) {
          const childItem = findItem(item.children);
          if (childItem) return childItem;
        }
      }
      return undefined;
    };

    return findItem(this._navigationItems);
  }
}
