import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
  queryParams?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  public breadcrumbs$: Observable<Breadcrumb[]> = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // Auto-generate breadcrumbs on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  /**
   * Set custom breadcrumbs manually
   */
  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  /**
   * Add a single breadcrumb to the end
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    const current = this.breadcrumbsSubject.value;
    this.breadcrumbsSubject.next([...current, breadcrumb]);
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }

  /**
   * Get current breadcrumbs
   */
  getBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbsSubject.value;
  }

  /**
   * Auto-generate breadcrumbs from route data
   */
  private updateBreadcrumbs(): void {
    const breadcrumbs: Breadcrumb[] = [];
    let currentRoute = this.activatedRoute.root;
    let url = '';

    do {
      const childrenRoutes = currentRoute.children;
      currentRoute = null as any;

      childrenRoutes.forEach(route => {
        if (route.outlet === 'primary') {
          const routeSnapshot = route.snapshot;
          url += '/' + routeSnapshot.url.map(segment => segment.path).join('/');

          // Get breadcrumb from route data
          const breadcrumb = route.snapshot.data['breadcrumb'];
          const title = route.snapshot.data['title'];
          
          if (breadcrumb || title) {
            breadcrumbs.push({
              label: breadcrumb || title,
              url: url,
              icon: route.snapshot.data['breadcrumbIcon']
            });
          }

          currentRoute = route;
        }
      });
    } while (currentRoute);

    // Always add home as first breadcrumb
    if (breadcrumbs.length > 0 && breadcrumbs[0].url !== '/app') {
      breadcrumbs.unshift({
        label: 'Home',
        url: '/app',
        icon: 'home'
      });
    }

    this.breadcrumbsSubject.next(breadcrumbs);
  }

  /**
   * Build breadcrumbs for specific contexts
   */
  buildCorporateClientBreadcrumbs(clientId: number, clientName: string, additionalCrumbs: Breadcrumb[] = []): void {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', url: '/app', icon: 'home' },
      { label: 'Corporate Clients', url: '/app/corporate-clients', icon: 'business' },
      { label: clientName, url: `/app/corporate-clients/${clientId}`, icon: 'account_balance' },
      ...additionalCrumbs
    ];
    this.setBreadcrumbs(breadcrumbs);
  }

  buildContractBreadcrumbs(clientId: number, clientName: string, contractId: number, contractName: string, additionalCrumbs: Breadcrumb[] = []): void {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', url: '/app', icon: 'home' },
      { label: 'Corporate Clients', url: '/app/corporate-clients', icon: 'business' },
      { label: clientName, url: `/app/corporate-clients/${clientId}`, icon: 'account_balance' },
      { label: 'Contracts', url: `/app/corporate-clients/${clientId}/contracts`, icon: 'description' },
      { label: contractName, url: `/app/corporate-clients/${clientId}/contracts/${contractId}`, icon: 'assignment' },
      ...additionalCrumbs
    ];
    this.setBreadcrumbs(breadcrumbs);
  }

  buildMedicalProviderBreadcrumbs(providerId: number, providerName: string, additionalCrumbs: Breadcrumb[] = []): void {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', url: '/app', icon: 'home' },
      { label: 'Medical Providers', url: '/app/medical-providers', icon: 'local_hospital' },
      { label: providerName, url: `/app/medical-providers/${providerId}`, icon: 'medical_services' },
      ...additionalCrumbs
    ];
    this.setBreadcrumbs(breadcrumbs);
  }
}

