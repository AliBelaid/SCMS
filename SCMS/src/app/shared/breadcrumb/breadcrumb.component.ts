import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { BreadcrumbService, Breadcrumb } from '../services/breadcrumb.service';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: Breadcrumb[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.breadcrumbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Navigate to a specific breadcrumb location
   */
  navigate(breadcrumb: Breadcrumb): void {
    if (!breadcrumb.url) {
      return;
    }

    if (breadcrumb.queryParams) {
      this.router.navigate([breadcrumb.url], { 
        queryParams: breadcrumb.queryParams,
        queryParamsHandling: 'merge' 
      });
    } else {
      this.router.navigate([breadcrumb.url]);
    }
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Check if this is the last breadcrumb (current page)
   */
  isLast(index: number): boolean {
    return index === this.breadcrumbs.length - 1;
  }

  /**
   * Check if breadcrumb should be clickable
   */
  isClickable(breadcrumb: Breadcrumb, index: number): boolean {
    return !this.isLast(index) && !!breadcrumb.url;
  }
}