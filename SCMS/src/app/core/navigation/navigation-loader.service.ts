import { Injectable } from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { NavigationItem } from './navigation-item.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NavigationConfigService } from './navigation-config.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  updateItems(items: NavigationItem[]) {
    this._items.next(items);
  }

  private getTranslation(key: string): string {
    try {
      const translation = this.translate.instant(key);
      return translation !== key ? translation : key;
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  constructor(
    private readonly layoutService: VexLayoutService, 
    public translate: TranslateService,
    private navigationConfigService: NavigationConfigService
  ) {
    // Initialize language from localStorage
    const lng = localStorage.getItem('userLang') || localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(lng);
    
    console.log('Navigation service initialized with language:', lng);
    
    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      console.log('Language changed, reloading navigation');
      this.loadNavigation();
    });
    
    // Load navigation immediately, then reload when translations are ready
    this.loadNavigation();
    
    // Also reload when translations are fully loaded
    this.translate.stream('HEALTH_EXPENSE_MANAGEMENT').subscribe(() => {
      console.log('Translations loaded, updating navigation');
      this.loadNavigation();
    });
  }

  loadNavigation(): void {
    try {
      // Get navigation items from the configuration service
      const navigationItems = this.navigationConfigService.getNavigationItems();
      this.updateItems(navigationItems);
      
      console.log('Navigation loaded successfully:', navigationItems.length, 'items');
    } catch (error) {
      console.error('Error loading navigation:', error);
    }
  }

  // Legacy method - keeping for backward compatibility but now using config service
  private loadNavigationLegacy(): void {
    this._items.next(
      [
      {
        type: 'subheading',
        label: 'Insurance Management System',
        children: [
          // Main Dashboard
          {
            type: 'link',
            label: 'Main Dashboard',
            route: '/app/insurance/dashboard',
            icon: 'mat:dashboard',
            roles: ['tpa-admin', 'DataEntry', 'insurance-company', 'corporate-client', 'subscriber'],
            description: 'Main system overview and metrics'
          },

          // Entity Management Group
          {
            type: 'subheading',
            label: 'Entity Management',
            children: [
              {
                type: 'dropdown',
                label: 'Insurance Companies',
                icon: 'mat:business',
                roles: ['tpa-admin', 'DataEntry', 'insurance-company'],
                children: [
                  {
                    type: 'link',
                    label: 'Companies List',
                    route: '/app/insurance/insurance-companies',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Create Company',
                    route: '/app/insurance/insurance-companies/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Company Profile',
                    route: '/app/insurance/insurance-companies/:id',
                    icon: 'mat:business',
                    roles: ['tpa-admin', 'DataEntry', 'insurance-company']
                  },
                  {
                    type: 'link',
                    label: 'Edit Company',
                    route: '/app/insurance/insurance-companies/:id/edit',
                    icon: 'mat:edit',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Company Contracts',
                    route: '/app/insurance/insurance-companies/:id/contracts',
                    icon: 'mat:assignment',
                    roles: ['tpa-admin', 'DataEntry', 'insurance-company']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Corporate Clients',
                icon: 'mat:domain',
                roles: ['tpa-admin', 'DataEntry', 'corporate-client'],
                children: [
                  {
                    type: 'link',
                    label: 'Clients List',
                    route: '/app/insurance/corporate-clients',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Create Client',
                    route: '/app/insurance/corporate-clients/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Client Profile',
                    route: '/app/insurance/corporate-clients/:id',
                    icon: 'mat:domain',
                    roles: ['tpa-admin', 'DataEntry', 'corporate-client']
                  },
                  {
                    type: 'link',
                    label: 'Edit Client',
                    route: '/app/insurance/corporate-clients/:id/edit',
                    icon: 'mat:edit',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Client Contracts',
                    route: '/app/insurance/corporate-clients/:id/contracts',
                    icon: 'mat:assignment',
                    roles: ['tpa-admin', 'DataEntry', 'corporate-client']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Risk Carriers',
                icon: 'mat:shield',
                roles: ['tpa-admin', 'DataEntry', 'insurance-company', 'corporate-client'],
                children: [
                  {
                    type: 'link',
                    label: 'Carriers List',
                    route: '/app/insurance/risk-carriers',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Create Carrier',
                    route: '/app/insurance/risk-carriers/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Carrier Profile',
                    route: '/app/insurance/risk-carriers/:id',
                    icon: 'mat:shield',
                    roles: ['tpa-admin', 'DataEntry', 'insurance-company', 'corporate-client']
                  },
                  {
                    type: 'link',
                    label: 'Edit Carrier',
                    route: '/app/insurance/risk-carriers/:id/edit',
                    icon: 'mat:edit',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Carrier Contracts',
                    route: '/app/insurance/risk-carriers/:id/contracts',
                    icon: 'mat:assignment',
                    roles: ['tpa-admin', 'DataEntry', 'insurance-company', 'corporate-client']
                  }
                ]
              }
            ]
          },

          // Operations Management Group
          {
            type: 'subheading',
            label: 'Operations Management',
            children: [
              {
                type: 'dropdown',
                label: 'Subscribers',
                icon: 'mat:people',
                roles: ['tpa-admin', 'insurance-company', 'subscriber'],
                children: [
                  {
                    type: 'link',
                    label: 'Subscribers List',
                    route: '/app/insurance/subscriber',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'insurance-company']
                  },
                  {
                    type: 'link',
                    label: 'Create Subscriber',
                    route: '/app/insurance/subscriber/create',
                    icon: 'mat:person_add',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Edit Subscriber',
                    route: '/app/insurance/subscriber/edit/:id',
                    icon: 'mat:edit',
                    roles: ['tpa-admin', 'subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Subscriber Dashboard',
                    route: '/app/insurance/subscriber/dashboard',
                    icon: 'mat:dashboard',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Subscriber Profile',
                    route: '/app/insurance/subscriber/profile/:id',
                    icon: 'mat:account_box',
                    roles: ['tpa-admin', 'subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Family Management',
                    route: '/app/insurance/subscriber/family/:id',
                    icon: 'mat:family_restroom',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Claims History',
                    route: '/app/insurance/subscriber/claims/history',
                    icon: 'mat:history',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Benefits Overview',
                    route: '/app/insurance/subscriber/benefits',
                    icon: 'mat:health_and_safety',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Benefits Utilization',
                    route: '/app/insurance/subscriber/benefits/utilization',
                    icon: 'mat:analytics',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Dependents',
                    route: '/app/insurance/subscriber/dependents',
                    icon: 'mat:family_restroom',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Add Dependent',
                    route: '/app/insurance/subscriber/dependents/add',
                    icon: 'mat:person_add_alt',
                    roles: ['subscriber']
                  },
                  {
                    type: 'link',
                    label: 'ID Card',
                    route: '/app/insurance/subscriber/id-card',
                    icon: 'mat:badge',
                    roles: ['subscriber']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Medical Providers',
                icon: 'mat:local_hospital',
                roles: ['tpa-admin', 'medical-provider', 'hospital-system'],
                children: [
                  {
                    type: 'link',
                    label: 'Provider Registration',
                    route: '/app/insurance/provider/register',
                    icon: 'mat:person_add',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Provider Dashboard',
                    route: '/app/insurance/provider/dashboard',
                    icon: 'mat:dashboard',
                    roles: ['medical-provider', 'hospital-system']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Service Types',
                icon: 'mat:medical_services',
                roles: ['tpa-admin', 'DataEntry'],
                children: [
                  {
                    type: 'link',
                    label: 'Service Types List',
                    route: '/app/insurance/service-types',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Create Service Type',
                    route: '/app/insurance/service-types/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Edit Service Type',
                    route: '/app/insurance/service-types/edit/:id',
                    icon: 'mat:edit',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'Service Type Detail',
                    route: '/app/insurance/service-types/detail/:id',
                    icon: 'mat:info',
                    roles: ['tpa-admin', 'medical-provider', 'hospital-system', 'DataEntry']
                  }
                ]
              }
            ]
          },

          // Administration Group
          {
            type: 'subheading',
            label: 'Administration',
            children: [
              {
                type: 'dropdown',
                label: 'TPA Administration',
                icon: 'mat:admin_panel_settings',
                roles: ['tpa-admin', 'DataEntry'],
                children: [
                  {
                    type: 'link',
                    label: 'TPA Dashboard',
                    route: '/app/insurance/tpa-admin/dashboard',
                    icon: 'mat:dashboard',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'dropdown',
                    label: 'Pre-Approvals',
                    icon: 'mat:approval',
                    roles: ['tpa-admin'],
                    children: [
                      {
                        type: 'link',
                        label: 'Pre-Approvals List',
                        route: '/app/insurance/tpa-admin/pre-approvals',
                        icon: 'mat:list',
                        roles: ['tpa-admin']
                      },
                      {
                        type: 'link',
                        label: 'Pre-Approval Workflow',
                        route: '/app/insurance/tpa-admin/pre-approvals/workflow',
                        icon: 'mat:workflow',
                        roles: ['tpa-admin']
                      }
                    ]
                  },
                  {
                    type: 'dropdown',
                    label: 'Contracts',
                    icon: 'mat:assignment',
                    roles: ['tpa-admin'],
                    children: [
                      {
                        type: 'link',
                        label: 'Contracts List',
                        route: '/app/insurance/tpa-admin/contracts',
                        icon: 'mat:list',
                        roles: ['tpa-admin']
                      },
                      {
                        type: 'link',
                        label: 'Create Contract',
                        route: '/app/insurance/tpa-admin/contracts/create',
                        icon: 'mat:add',
                        roles: ['tpa-admin']
                      },
                      {
                        type: 'link',
                        label: 'Contract Details',
                        route: '/app/insurance/tpa-admin/contracts/detail',
                        icon: 'mat:info',
                        roles: ['tpa-admin']
                      }
                    ]
                  },
                  {
                    type: 'link',
                    label: 'Benefit Tables',
                    route: '/app/insurance/tpa-admin/benefit-tables',
                    icon: 'mat:table_chart',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Subscribers',
                    route: '/app/insurance/tpa-admin/subscribers',
                    icon: 'mat:people',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Providers',
                    route: '/app/insurance/tpa-admin/providers',
                    icon: 'mat:local_hospital',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Policy Management',
                    route: '/app/insurance/tpa-admin/policy-management',
                    icon: 'mat:policy',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Medical Network',
                    route: '/app/insurance/tpa-admin/medical-network',
                    icon: 'mat:network_node',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Medical Review',
                    route: '/app/insurance/tpa-admin/medical-review',
                    icon: 'mat:medical_services',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'ID Cards',
                    route: '/app/insurance/tpa-admin/id-cards',
                    icon: 'mat:badge',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Clinic Management',
                    route: '/app/insurance/tpa-admin/clinic-management',
                    icon: 'mat:local_hospital',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'TPA Reports',
                    route: '/app/insurance/tpa-admin/reports',
                    icon: 'mat:assessment',
                    roles: ['tpa-admin']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'ICD-10 Management',
                icon: 'mat:code',
                roles: ['tpa-admin', 'DataEntry'],
                children: [
                  {
                    type: 'link',
                    label: 'ICD-10 Categories',
                    route: '/app/insurance/icd10/categories',
                    icon: 'mat:category',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'ICD-10 Tree View',
                    route: '/app/insurance/icd10/tree',
                    icon: 'mat:account_tree',
                    roles: ['tpa-admin', 'DataEntry']
                  },
                  {
                    type: 'link',
                    label: 'ICD-10 Detail',
                    route: '/app/insurance/icd10/:code',
                    icon: 'mat:info',
                    roles: ['tpa-admin', 'medical-provider', 'hospital-system', 'DataEntry']
                  }
                ]
              }
            ]
          },

          // Legacy Company Routes (for backward compatibility)
          {
            type: 'subheading',
            label: 'Legacy Company Management',
            children: [
              {
                type: 'dropdown',
                label: 'Legacy Company',
                icon: 'mat:business',
                roles: ['tpa-admin', 'insurance-company', 'hospital-system'],
                children: [
                  {
                    type: 'link',
                    label: 'Company Dashboard',
                    route: '/app/insurance/company/dashboard',
                    icon: 'mat:dashboard',
                    roles: ['tpa-admin', 'insurance-company', 'hospital-system']
                  },
                  {
                    type: 'link',
                    label: 'Company List',
                    route: '/app/insurance/companies',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'insurance-company']
                  },
                  {
                    type: 'link',
                    label: 'Create Company',
                    route: '/app/insurance/companies/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Company Profile',
                    route: '/app/insurance/companies/:code',
                    icon: 'mat:business',
                    roles: ['tpa-admin', 'insurance-company']
                  },
                  {
                    type: 'link',
                    label: 'Edit Company',
                    route: '/app/insurance/companies/:code/edit',
                    icon: 'mat:edit',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'dropdown',
                    label: 'Company Contracts',
                    icon: 'mat:assignment',
                    roles: ['tpa-admin', 'insurance-company'],
                    children: [
                      {
                        type: 'link',
                        label: 'Contracts List',
                        route: '/app/insurance/companies/:code/contracts',
                        icon: 'mat:list',
                        roles: ['tpa-admin', 'insurance-company']
                      },
                      {
                        type: 'link',
                        label: 'Create Contract',
                        route: '/app/insurance/companies/:code/contracts/create',
                        icon: 'mat:add',
                        roles: ['tpa-admin']
                      },
                      {
                        type: 'link',
                        label: 'Contract Detail',
                        route: '/app/insurance/companies/:code/contracts/detail/:id',
                        icon: 'mat:info',
                        roles: ['tpa-admin', 'insurance-company']
                      },
                      {
                        type: 'link',
                        label: 'Edit Contract',
                        route: '/app/insurance/companies/:code/contracts/edit/:id',
                        icon: 'mat:edit',
                        roles: ['tpa-admin']
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Data Entry Group
          {
            type: 'subheading',
            label: 'Data Entry & Batch Processing',
            children: [
              {
                type: 'dropdown',
                label: 'Batch Management',
                icon: 'mat:edit_note',
                roles: ['tpa-admin', 'dataentry', 'medical-reviewer', 'medical-auditor'],
                children: [
                  {
                    type: 'link',
                    label: 'Batch List',
                    route: '/app/insurance/data-entry/batches',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'medical-reviewer', 'medical-auditor']
                  },
                  {
                    type: 'link',
                    label: 'Create Batch',
                    route: '/app/insurance/data-entry/batches/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin', 'dataentry']
                  },
                  {
                    type: 'link',
                    label: 'Batch Reviewer',
                    route: '/app/insurance/data-entry/batches/reviewer',
                    icon: 'mat:rate_review',
                    roles: ['tpa-admin', 'medical-reviewer', 'medical-auditor']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'subheading',
        label: this.getTranslation('HOSPITAL_SYSTEM'),
        children: [
          {
            type: 'link',
            label: this.getTranslation('RECEPTION'),
            route: '/app/reception',
            icon: 'mat:person'
          },
          {
            type: 'link',
            label: this.getTranslation('PATIENTS'),
            route: '/app/patients',
            icon: 'mat:people'
          },
          {
            type: 'link',
            label: this.getTranslation('DOCTOR'),
            route: '/app/doctor',
            icon: 'mat:local_hospital'
          },
          {
            type: 'link',
            label: this.getTranslation('SERVICE_PRICING'),
            route: '/app/service-pricing',
            icon: 'mat:attach_money'
          },
          {
            type: 'dropdown',
            label: this.getTranslation('TREASURY'),
            icon: 'mat:account_balance',
            children: [
              {
                type: 'link',
                label: 'Dashboard',
                route: '/app/treasury/dashboard',
                icon: 'mat:dashboard'
              },
              {
                type: 'link',
                label: 'Settlements',
                route: '/app/treasury/settlements',
                icon: 'mat:account_balance_wallet'
              },
              {
                type: 'link',
                label: 'Doctor Payouts',
                route: '/app/treasury/doctor-payouts',
                icon: 'mat:payments'
              },
              {
                type: 'link',
                label: 'Expenses',
                route: '/app/treasury/expenses',
                icon: 'mat:receipt'
              },
              {
                type: 'link',
                label: 'Backup Queue',
                route: '/app/treasury/backup-queue',
                icon: 'mat:queue'
              }
            ]
          },
          // Additional Hospital System Routes
          {
            type: 'dropdown',
            label: 'Medical Services',
            icon: 'mat:medical_services',
            children: [
              {
                type: 'link',
                label: 'Pharmacy',
                route: '/app/pharmacy',
                icon: 'mat:local_pharmacy'
              },
              {
                type: 'link',
                label: 'Medical Records',
                route: '/app/medical-record',
                icon: 'mat:folder_shared'
              },
              {
                type: 'link',
                label: 'Appointments',
                route: '/app/appointments',
                icon: 'mat:event'
              },
              {
                type: 'link',
                label: 'Analysis',
                route: '/app/analysis/patient',
                icon: 'mat:science'
              },
              {
                type: 'link',
                label: 'Surgery',
                route: '/app/surgery',
                icon: 'mat:medical_services'
              },
              {
                type: 'link',
                label: 'Emergency Admission',
                route: '/app/emergency-admission',
                icon: 'mat:emergency'
              },
              {
                type: 'link',
                label: 'Hospital Requests',
                route: '/app/hospital-requests',
                icon: 'mat:request_page'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Imaging & Radiology',
            icon: 'mat:photo_camera',
            children: [
              {
                type: 'link',
                label: 'Imaging Types',
                route: '/app/imaging/types',
                icon: 'mat:photo_camera'
              },
              {
                type: 'link',
                label: 'Imaging Requests',
                route: '/app/imaging/request',
                icon: 'mat:add_a_photo'
              },
              {
                type: 'link',
                label: 'Radiology Templates',
                route: '/app/radiology/templates',
                icon: 'mat:template'
              },
              {
                type: 'link',
                label: 'Create Report',
                route: '/app/radiology/create-report',
                icon: 'mat:edit_note'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'HCPCS Management',
            icon: 'mat:receipt_long',
            children: [
              {
                type: 'link',
                label: 'HCPCS Codes',
                route: '/app/hcpcs/list',
                icon: 'mat:list'
              },
              {
                type: 'link',
                label: 'Create HCPCS Code',
                route: '/app/hcpcs/create',
                icon: 'mat:add_circle'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Administration',
            icon: 'mat:admin_panel_settings',
            children: [
              {
                type: 'link',
                label: 'Hospital Management',
                route: '/app/hospital',
                icon: 'mat:business'
              },
              {
                type: 'link',
                label: 'Rooms',
                route: '/app/rooms',
                icon: 'mat:meeting_room'
              },
              {
                type: 'link',
                label: 'Admin Panel',
                route: '/app/admin',
                icon: 'mat:admin_panel_settings'
              },
              {
                type: 'link',
                label: 'Employee Registration',
                route: '/app/employee-registration',
                icon: 'mat:person_add'
              }
            ]
          }
        ]
      },
      {
        type: 'subheading',
        label: 'User Management',
        children: [
          {
            type: 'link',
            label: 'User Profile',
            route: '/app/user',
            icon: 'mat:person'
          }
        ]
      },
      {
        type: 'subheading',
        label: 'Settings',
        children: [
          {
            type: 'dropdown',
            label: 'System Settings',
            icon: 'mat:settings',
            children: [
              {
                type: 'link',
                label: 'Notification Settings',
                route: '/app/settings/notification',
                icon: 'mat:notifications'
              },
              {
                type: 'link',
                label: 'Payment Settings',
                route: '/app/settings/payment',
                icon: 'mat:payment'
              },
              {
                type: 'link',
                label: 'Printer Settings',
                route: '/app/settings/printer',
                icon: 'mat:print'
              },
              {
                type: 'link',
                label: 'System Settings',
                route: '/app/settings/system',
                icon: 'mat:settings_system_daydream'
              }
            ]
          },
          {
            type: 'link',
            label: 'Configuration',
            route: () => this.layoutService.openConfigpanel(),
            icon: 'mat:settings'
          }
        ]
      },
      {
        type: 'subheading',
        label: 'Documentation & Support',
        children: [
          {
            type: 'link',
            label: 'Documentation',
            route: '/app/documentation',
            icon: 'mat:description'
          },
          {
            type: 'link',
            label: 'Treatment Guidelines',
            route: '/app/treatment',
            icon: 'mat:healing'
          }
        ]
      }
    ]);
  }
}

