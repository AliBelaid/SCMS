import {
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  inject,
  OnInit
} from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { VexConfigService } from '@vex/config/vex-config.service';
import { filter, map, startWith, switchMap, take } from 'rxjs/operators';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { NavigationLoaderService } from '../../../core/navigation/navigation-loader.service';
import { NavigationConfigService } from '../../../core/navigation/navigation-config.service';
import { VexPopoverService } from '@vex/components/vex-popover/vex-popover.service';
import { MegaMenuComponent } from './mega-menu/mega-menu.component';
import { Observable, of } from 'rxjs';
import { NavigationComponent } from '../navigation/navigation.component';
import { ToolbarUserComponent } from './toolbar-user/toolbar-user.component';
import { ToolbarNotificationsComponent } from './toolbar-notifications/toolbar-notifications.component';
import { NavigationItemComponent } from '../navigation/navigation-item/navigation-item.component';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationItem } from '../../../core/navigation/navigation-item.interface';
import { checkRouterChildsData } from '@vex/utils/check-router-childs-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'vex-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    NgIf,
    RouterLink,
    MatMenuModule,
    NgClass,
    NgFor,
    NavigationItemComponent,
    ToolbarNotificationsComponent,
    ToolbarUserComponent,
    NavigationComponent,
    AsyncPipe ,
    TranslateModule
  ]
})
export class ToolbarComponent implements OnInit {
  @HostBinding('class.shadow-b')
  showShadow: boolean = false;

  navigationItems$: Observable<NavigationItem[]> =
    this.navigationService.items$;
    //navigationItems = this.navigationService.items$.pipe(take(1)).subscribe((rep)=> rep);
  isHorizontalLayout$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.layout === 'horizontal')
  );
  isVerticalLayout$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.layout === 'vertical')
  );
  isNavbarInToolbar$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.navbar.position === 'in-toolbar')
  );
  isNavbarBelowToolbar$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.navbar.position === 'below-toolbar')
  );
  userVisible$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.toolbar.user.visible)
  );
  title$: Observable<string> = this.configService.select(
    (config) => config.sidenav.title
  );

  isDesktop$: Observable<boolean> = this.layoutService.isDesktop$;
  megaMenuOpen$: Observable<boolean> = of(false);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);



  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('userLang', lang);
    this.selectedLang = lang;
    this.selectedLang === 'ar' ? this.configService.updateConfig({ direction: 'rtl' }) : this.configService.updateConfig({ direction: 'ltr' });
    
    // Set default language and use it
    this.translate.setDefaultLang(this.selectedLang);
    this.translate.use(this.selectedLang);
    
    // Navigation will be automatically updated by the NavigationLoaderService
    // when it detects the language change
  }
  selectedLang = localStorage.getItem('userLang') || 'ar';


  constructor(
    private readonly layoutService: VexLayoutService,
    private readonly configService: VexConfigService,
    private readonly navigationService: NavigationService,
    private readonly navigationLoaderService: NavigationLoaderService,
    private readonly navigationConfigService: NavigationConfigService,
    private readonly popoverService: VexPopoverService,
    private readonly router: Router,
    public user: UserService,
    public translate: TranslateService
  ) {
    // Initialize language from localStorage
    const savedLang = localStorage.getItem('userLang') || 'ar';
    this.selectedLang = savedLang;
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.showShadow = checkRouterChildsData(
          this.router.routerState.root.snapshot,
          (data) => data.toolbarShadowEnabled ?? false
        );
      });
  }

  openQuickpanel(): void {
    this.layoutService.openQuickpanel();
  }

  openSidenav(): void {
    this.layoutService.openSidenav();
  }

  openMegaMenu(origin: ElementRef | HTMLElement): void {
    this.megaMenuOpen$ = of(
      this.popoverService.open({
        content: MegaMenuComponent,
        origin,
        offsetY: 12,
        position: [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          }
        ]
      })
    ).pipe(
      switchMap((popoverRef) => popoverRef.afterClosed$.pipe(map(() => false))),
      startWith(true)
    );
  }

  openSearch(): void {
    this.layoutService.openSearch();
  }



  // Legacy method - now using NavigationConfigService
  private loadMenuItemsLegacy():NavigationItem[] {
    return   [
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
                label: 'Pre-Approvals',
                icon: 'mat:approval',
                roles: ['tpa-admin', 'DataEntry'],
                children: [
                  {
                    type: 'link',
                    label: 'Pre-Approvals List',
                    route: '/app/insurance/tpa-admin/pre-approvals',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'DataEntry']
                  }
                ]
              },
              {
                type: 'link',
                label: 'Pre-Approval Workflow',
                route: '/app/insurance/tpa-admin/pre-approvals/workflow',
                icon: 'mat:workflow',
                roles: ['tpa-admin', 'DataEntry']
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
                roles: ['tpa-admin', 'insurance-company', 'subscriber' ,'Admin'],
                children: [
                  {
                    type: 'link',
                    label: 'Subscribers List',
                    route: '/app/insurance/subscriber',
                    icon: 'mat:list',
                    roles: ['tpa-admin', 'insurance-company' , 'subscriber']
                  },
                  {
                    type: 'link',
                    label: 'Create Subscriber',
                    route: '/app/insurance/subscriber/create',
                    icon: 'mat:person_add',
                    roles: ['tpa-admin' ,'Admin']
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
          },
  
          // Service Types Routes
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
              }
            ]
          },
  
          // Claims Management Routes
          {
            type: 'dropdown',
            label: 'Claims Management',
            icon: 'mat:description',
            roles: ['tpa-admin', 'hospital-system', 'insurance-company', 'medical-provider', 'subscriber'],
            children: [
              {
                type: 'link',
                label: 'Batch List',
                route: '/app/data-entry/batches',
                icon: 'mat:list',
                roles: ['tpa-admin', 'medical-reviewer', 'medical-auditor']
              },
              {
                type: 'link',
                label: 'Create Batch',
                route: '/app/data-entry/batches/create',
                icon: 'mat:add',
                roles: ['tpa-admin', 'dataentry']
              },
              {
                type: 'link',
                label: 'Batch Reviewer',
                route: '/app/data-entry/batches/reviewer',
                icon: 'mat:rate_review',
                roles: ['tpa-admin', 'medical-reviewer', 'medical-auditor']
              }
            ]
          },
  
          // Pre-Approvals Routes
          {
            type: 'dropdown',
            label: 'Pre-Approvals',
            icon: 'mat:approval',
            roles: ['tpa-admin', 'hospital-system', 'insurance-company', 'medical-provider', 'subscriber'],
            children: [
              {
                type: 'link',
                label: 'Pre-Approvals List',
                route: '/app/insurance/tpa-admin/pre-approvals',
                icon: 'mat:list',
                roles: ['tpa-admin', 'hospital-system', 'insurance-company', 'medical-provider', 'subscriber']
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
  
          // ICD10 Management Routes
          {
            type: 'dropdown',
            label: 'ICD10 Management',
            icon: 'mat:medical_services',
            roles: ['tpa-admin', 'hospital-system', 'medical-provider'],
            children: [
              {
                type: 'link',
                label: 'ICD10 Tree View',
                route: '/app/insurance/icd10/tree',
                icon: 'mat:account_tree',
                roles: ['tpa-admin', 'hospital-system', 'medical-provider']
              },
              {
                type: 'link',
                label: 'ICD10 Categories',
                route: '/app/insurance/icd10/categories',
                icon: 'mat:category',
                roles: ['tpa-admin', 'hospital-system', 'medical-provider']
              },
              {
                type: 'link',
                label: 'ICD10 Detail',
                route: '/app/insurance/icd10/:code',
                icon: 'mat:info',
                roles: ['tpa-admin', 'hospital-system', 'medical-provider']
              }
            ]
          },
  
          // Subscriber Routes
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
                label: 'Add Subscriber',
                route: '/app/insurance/subscriber/create',
                icon: 'mat:person_add',
                roles: ['tpa-admin', 'insurance-company']
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
                roles: ['subscriber']
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
  
          // Medical Provider Management System
          {
            type: 'dropdown',
            label: 'Provider Management',
            icon: 'mat:local_hospital',
            roles: ['tpa-admin', 'medical-provider', 'hospital-system'],
            children: [
              {
                type: 'link',
                label: 'Provider Dashboard',
                route: '/app/medical-providers',
                icon: 'mat:dashboard',
                roles: ['tpa-admin', 'hospital-system', 'medical-provider']
              },
              {
                type: 'link',
                label: 'Provider Management',
                route: '/app/medical-providers/management',
                icon: 'mat:manage_accounts',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Provider List',
                route: '/app/medical-providers/list',
                icon: 'mat:list',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Create Provider',
                route: '/app/medical-providers/create',
                icon: 'mat:person_add',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Provider medical-providers',
                route: '/app/medical-providers/medical-providers',
                icon: 'mat:location_on',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Provider Contracts',
                route: '/app/medical-providers/contracts',
                icon: 'mat:assignment',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Price List Management',
                route: '/app/medical-providers/price-lists',
                icon: 'mat:price_check',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Insurance Participation',
                route: '/app/medical-providers/insurance-participation',
                icon: 'mat:handshake',
                roles: ['tpa-admin', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Provider Reports',
                route: '/app/medical-providers/reports',
                icon: 'mat:assessment',
                roles: ['tpa-admin', 'hospital-system']
              }
            ]
          },
  
          // Legacy Medical Provider Routes (for backward compatibility)
          {
            type: 'dropdown',
            label: 'Legacy Providers',
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
              },
              {
                type: 'link',
                label: 'Provider Claims',
                route: '/app/insurance/claims',
                icon: 'mat:receipt',
                roles: ['medical-provider', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Submit Claim',
                route: '/app/insurance/claims/create',
                icon: 'mat:add_circle',
                roles: ['medical-provider', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Provider Services',
                route: '/app/insurance/provider/services',
                icon: 'mat:medical_services',
                roles: ['medical-provider', 'hospital-system']
              },
              {
                type: 'dropdown',
                label: 'Provider Claims',
                icon: 'mat:receipt',
                roles: ['medical-provider', 'hospital-system'],
                children: [
                  {
                    type: 'link',
                    label: 'My Claims',
                    route: '/app/insurance/provider/claims',
                    icon: 'mat:list',
                    roles: ['medical-provider', 'hospital-system']
                  },
                  {
                    type: 'link',
                    label: 'Submit Claim',
                    route: '/app/insurance/provider/claims/submit',
                    icon: 'mat:add',
                    roles: ['medical-provider', 'hospital-system']
                  },
                  {
                    type: 'link',
                    label: 'Claim Detail',
                    route: '/app/insurance/provider/claims/detail/:id',
                    icon: 'mat:info',
                    roles: ['medical-provider', 'hospital-system']
                  },
                  {
                    type: 'link',
                    label: 'Edit Claim',
                    route: '/app/insurance/provider/claims/edit/:id',
                    icon: 'mat:edit',
                    roles: ['medical-provider', 'hospital-system']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Provider Pre-Approvals',
                icon: 'mat:approval',
                roles: ['medical-provider', 'hospital-system'],
                children: [
                  {
                    type: 'link',
                    label: 'My Requests',
                    route: '/app/insurance/provider/pre-approvals',
                    icon: 'mat:list',
                    roles: ['medical-provider', 'hospital-system']
                  },
                  {
                    type: 'link',
                    label: 'Request Approval',
                    route: '/app/insurance/provider/pre-approvals/request',
                    icon: 'mat:add',
                    roles: ['medical-provider', 'hospital-system']
                  },
                  {
                    type: 'link',
                    label: 'Request Detail',
                    route: '/app/insurance/provider/pre-approvals/detail/:id',
                    icon: 'mat:info',
                    roles: ['medical-provider', 'hospital-system']
                  }
                ]
              },
              {
                type: 'link',
                label: 'Provider Reports',
                route: '/app/insurance/provider/reports',
                icon: 'mat:assessment',
                roles: ['medical-provider', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Eligibility Check',
                route: '/app/insurance/provider/eligibility',
                icon: 'mat:verified_user',
                roles: ['medical-provider', 'hospital-system']
              },
              {
                type: 'link',
                label: 'Profile Management',
                route: '/app/insurance/provider/profile',
                icon: 'mat:account_box',
                roles: ['medical-provider', 'hospital-system']
              }
            ]
          },
  
          // Data Entry Routes
          {
            type: 'dropdown',
            label: 'Data Entry',
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
          },
  
          // TPA Admin Routes
          {
            type: 'dropdown',
            label: 'TPA Admin',
            icon: 'mat:admin_panel_settings',
            roles: ['tpa-admin'],
            children: [
              {
                type: 'link',
                label: 'Dashboard',
                route: '/app/insurance/tpa-admin/dashboard',
                icon: 'mat:dashboard',
                roles: ['tpa-admin']
              },
              {
                type: 'dropdown',
                label: 'Claims Management',
                icon: 'mat:description',
                roles: ['tpa-admin'],
                children: [
                  {
                    type: 'link',
                    label: 'Claims List',
                    route: '/app/insurance/tpa-admin/claims',
                    icon: 'mat:list',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Create Claim',
                    route: '/app/insurance/tpa-admin/claims/create',
                    icon: 'mat:add',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Pending Claims',
                    route: '/app/insurance/tpa-admin/claims/pending',
                    icon: 'mat:pending',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Process Claims',
                    route: '/app/insurance/tpa-admin/claims/process',
                    icon: 'mat:play_arrow',
                    roles: ['tpa-admin']
                  },
                  {
                    type: 'link',
                    label: 'Claim Detail',
                    route: '/app/insurance/tpa-admin/claims/detail',
                    icon: 'mat:info',
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
                type: 'dropdown',
                label: 'Management Tools',
                icon: 'mat:settings',
                roles: ['tpa-admin'],
                children: [
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
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Subscribers',
                icon: 'mat:people',
                roles: ['tpa-admin'],
                children: [
                  {
                    type: 'link',
                    label: 'Subscribers List',
                    route: '/app/insurance/tpa-admin/subscribers',
                    icon: 'mat:list',
                    roles: ['tpa-admin']
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Providers',
                icon: 'mat:local_hospital',
                roles: ['tpa-admin'],
                children: [
                  {
                    type: 'link',
                    label: 'Providers List',
                    route: '/app/insurance/tpa-admin/providers',
                    icon: 'mat:list',
                    roles: ['tpa-admin']
                  }
                ]
              },
              {
                type: 'link',
                label: 'Clinic Management',
                route: '/app/insurance/tpa-admin/clinic-management',
                icon: 'mat:local_hospital',
                roles: ['tpa-admin']
              },
              {
                type: 'dropdown',
                label: 'Reports',
                icon: 'mat:assessment',
                roles: ['tpa-admin'],
                children: [
                  {
                    type: 'link',
                    label: 'Reports Dashboard',
                    route: '/app/insurance/tpa-admin/reports',
                    icon: 'mat:dashboard',
                    roles: ['tpa-admin']
                  }
                ]
              }
            ]
          },
  
        ]
      },
      
      // Hospital System Routes
      {
        type: 'subheading',
        label: 'Hospital System',
        children: [
          {
            type: 'link',
            label: 'Reception',
            route: '/app/reception',
            icon: 'mat:person'
          },
          {
            type: 'link',
            label: 'Hospital Dashboard',
            route: '/app/hospital',
            icon: 'mat:dashboard'
          },
          {
            type: 'dropdown',
            label: 'Patients',
            icon: 'mat:people',
            children: [
              {
                type: 'link',
                label: 'Patients List',
                route: '/app/patients',
                icon: 'mat:list'
              },
              {
                type: 'link',
                label: 'Create Patient',
                route: '/app/patients/create',
                icon: 'mat:person_add'
              },
              {
                type: 'link',
                label: 'Patient Profile',
                route: '/app/patients/:id',
                icon: 'mat:person'
              },
              {
                type: 'link',
                label: 'Patient Details',
                route: '/app/patients/:id/details',
                icon: 'mat:info'
              },
              {
                type: 'link',
                label: 'Patient History',
                route: '/app/patients/:id/history',
                icon: 'mat:history'
              },
              {
                type: 'link',
                label: 'Patient Appointments',
                route: '/app/patients/:id/appointments',
                icon: 'mat:event'
              },
              {
                type: 'link',
                label: 'Patient Overview',
                route: '/app/patients/:id/PatientOvreView',
                icon: 'mat:visibility'
              },
              {
                type: 'link',
                label: 'Patient Radiology',
                route: '/app/patients/:id/radiology',
                icon: 'mat:photo_camera'
              },
              {
                type: 'link',
                label: 'Patient Documents',
                route: '/app/patients/:id/documents',
                icon: 'mat:folder'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Doctor',
            icon: 'mat:local_hospital',
            children: [
              {
                type: 'link',
                label: 'Doctor List',
                route: '/app/doctor',
                icon: 'mat:list'
              },
              {
                type: 'link',
                label: 'Doctor Queue',
                route: '/app/doctor/queue/:id',
                icon: 'mat:queue'
              },
              {
                type: 'link',
                label: 'Doctor Profile',
                route: '/app/doctor/:id',
                icon: 'mat:person'
              },
              {
                type: 'link',
                label: 'Doctor Details',
                route: '/app/doctor/:id/details',
                icon: 'mat:info'
              },
              {
                type: 'link',
                label: 'Doctor Queue Management',
                route: '/app/doctor/:id/queue',
                icon: 'mat:queue'
              },
              {
                type: 'link',
                label: 'Doctor Schedule',
                route: '/app/doctor/:id/schedule',
                icon: 'mat:schedule'
              },
              {
                type: 'link',
                label: 'Doctor Balance',
                route: '/app/doctor/:id/balance',
                icon: 'mat:account_balance'
              },
              {
                type: 'link',
                label: 'Doctor Reports',
                route: '/app/doctor/:id/reports',
                icon: 'mat:assessment'
              },
              {
                type: 'link',
                label: 'Doctor Settings',
                route: '/app/doctor/:id/settings',
                icon: 'mat:settings'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Medical Services',
            icon: 'mat:medical_services',
            children: [
              {
                type: 'dropdown',
                label: 'Pharmacy',
                icon: 'mat:local_pharmacy',
                children: [
                  {
                    type: 'link',
                    label: 'Pharmacy Dashboard',
                    route: '/app/pharmacy',
                    icon: 'mat:dashboard'
                  },
                  {
                    type: 'link',
                    label: 'Create/Update Pharmacy',
                    route: '/app/pharmacy/create',
                    icon: 'mat:add'
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Medical Records',
                icon: 'mat:folder_shared',
                children: [
                  {
                    type: 'link',
                    label: 'Medical Records Dashboard',
                    route: '/app/medical-record',
                    icon: 'mat:dashboard'
                  },
                  {
                    type: 'link',
                    label: 'Patient Queue',
                    route: '/app/medical-record/queue/:id',
                    icon: 'mat:queue'
                  },
                  {
                    type: 'link',
                    label: 'Medical Record Detail',
                    route: '/app/medical-record/:id',
                    icon: 'mat:info'
                  },
                  {
                    type: 'link',
                    label: 'Medical Conditions',
                    route: '/app/medical-conditions/:id',
                    icon: 'mat:medical_services'
                  }
                ]
              },
              {
                type: 'dropdown',
                label: 'Appointments',
                icon: 'mat:event',
                children: [
                  {
                    type: 'link',
                    label: 'Appointments List',
                    route: '/app/appointments',
                    icon: 'mat:list'
                  },
                  {
                    type: 'link',
                    label: 'Finish Appointment',
                    route: '/app/appointments/finish',
                    icon: 'mat:check_circle'
                  }
                ]
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
                icon: 'mat:create'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Analysis & Laboratory',
            icon: 'mat:science',
            children: [
              {
                type: 'link',
                label: 'Patient Analysis',
                route: '/app/analysis/patient',
                icon: 'mat:person'
              },
              {
                type: 'link',
                label: 'Laboratory Analysis',
                route: '/app/analysis/laboratory',
                icon: 'mat:biotech'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Surgery & Emergency',
            icon: 'mat:medical_services',
            children: [
              {
                type: 'link',
                label: 'Surgery Management',
                route: '/app/surgery',
                icon: 'mat:healing'
              },
              {
                type: 'dropdown',
                label: 'Emergency Admission',
                icon: 'mat:emergency',
                children: [
                  {
                    type: 'link',
                    label: 'Emergency Dashboard',
                    route: '/app/emergency-admission',
                    icon: 'mat:dashboard'
                  },
                  {
                    type: 'link',
                    label: 'Create Emergency',
                    route: '/app/emergency-admission/create',
                    icon: 'mat:add'
                  },
                  {
                    type: 'link',
                    label: 'Update Emergency',
                    route: '/app/emergency-admission/update/:id',
                    icon: 'mat:edit'
                  }
                ]
              },
              {
                type: 'link',
                label: 'Hospital Requests',
                route: '/app/hospital-requests',
                icon: 'mat:request_quote'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Administration',
            icon: 'mat:admin_panel_settings',
            children: [
              {
                type: 'dropdown',
                label: 'Admin Panel',
                icon: 'mat:admin_panel_settings',
                children: [
                  {
                    type: 'link',
                    label: 'Admin Dashboard',
                    route: '/app/admin',
                    icon: 'mat:dashboard'
                  },
                  {
                    type: 'link',
                    label: 'User Management',
                    route: '/app/admin/user-management',
                    icon: 'mat:people'
                  },
                  {
                    type: 'link',
                    label: 'Photo Management',
                    route: '/app/admin/photo',
                    icon: 'mat:photo'
                  },
                  {
                    type: 'link',
                    label: 'Category Management',
                    route: '/app/admin/category-management',
                    icon: 'mat:category'
                  },
                  {
                    type: 'link',
                    label: 'Request Management',
                    route: '/app/admin/request-management',
                    icon: 'mat:request_quote'
                  }
                ]
              },
              {
                type: 'link',
                label: 'Rooms Management',
                route: '/app/rooms',
                icon: 'mat:room'
              },
              {
                type: 'dropdown',
                label: 'Social Services',
                icon: 'mat:people',
                children: [
                  {
                    type: 'link',
                    label: 'Social Dashboard',
                    route: '/app/social',
                    icon: 'mat:dashboard'
                  },
                  {
                    type: 'link',
                    label: 'Social Profile',
                    route: '/app/social',
                    icon: 'mat:person'
                  },
                  {
                    type: 'link',
                    label: 'Social Timeline',
                    route: '/app/social/timeline',
                    icon: 'mat:timeline'
                  }
                ]
              }
            ]
          }
        ]
      },
      
      // Treasury Routes
      {
        type: 'dropdown',
        label: 'Treasury',
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
            icon: 'mat:receipt_long'
          },
          {
            type: 'link',
            label: 'Doctor Balance',
            route: '/app/treasury/doctor-balance/:id',
            icon: 'mat:account_balance_wallet'
          },
          {
            type: 'link',
            label: 'Backup Queue',
            route: '/app/treasury/backup-queue',
            icon: 'mat:queue'
          }
        ]
      },
      
      // User Management
      {
        type: 'subheading',
        label: 'User Management',
        children: [
          {
            type: 'link',
            label: 'User Profile',
            route: '/app/user',
            icon: 'mat:person'
          },
          {
            type: 'link',
            label: 'Employee Registration',
            route: '/app/employee-registration',
            icon: 'mat:person_add'
          }
        ]
      },
      
      // Settings
      {
        type: 'dropdown',
        label: 'Settings',
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
            label: 'System Settings',
            route: '/app/settings/system',
            icon: 'mat:settings_system_daydream'
          },
          {
            type: 'link',
            label: 'Printer Settings',
            route: '/app/settings/printer',
            icon: 'mat:print'
          }
        ]
      },
      
      // Service Pricing
      {
        type: 'dropdown',
        label: 'Service Pricing',
        icon: 'mat:attach_money',
        children: [
          {
            type: 'link',
            label: 'Service Pricing Dashboard',
            route: '/app/service-pricing',
            icon: 'mat:dashboard'
          },
          {
            type: 'link',
            label: 'Services Pricing',
            route: '/app/services/pricing',
            icon: 'mat:monetization_on'
          }
        ]
      },
      
      // Documentation
      {
        type: 'subheading',
        label: 'Documentation',
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
    ]; 

    }
  }


