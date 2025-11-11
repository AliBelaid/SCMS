import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Order } from '../../../models/department.model';
import { DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);

  readonly order$: Observable<Order | undefined> = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      id ? this.departmentService.getOrderById(id) : of(undefined)
    )
  );

  readonly statusLabels: Record<Order['status'], string> = {
    pending: 'قيد الانتظار',
    'in-progress': 'قيد التنفيذ',
    completed: 'مكتملة',
    archived: 'مؤرشفة',
  };

  readonly priorityLabels: Record<Order['priority'], string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };
}

