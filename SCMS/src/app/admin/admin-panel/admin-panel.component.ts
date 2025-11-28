import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  animations: [
    fadeInUp400ms,
    stagger40ms,
    trigger('tabTransition', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(10px)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', animate('300ms ease-in')),
      transition('* => void', animate('300ms ease-out'))
    ])
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    VexBreadcrumbsComponent,
    VexPageLayoutComponent,
    VexPageLayoutHeaderDirective,
    VexPageLayoutContentDirective,
    MatButtonToggleModule,
    TranslateModule,
  ]
})
export class AdminPanelComponent implements OnInit {
  layoutCtrl = new FormControl('fullwidth');
  breadcrumbs: string[] = ['Admin'];

  ngOnInit(): void {}
}
