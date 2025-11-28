import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Department } from 'src/app/document-management/department.model';
import { DepartmentService } from 'src/app/document-management/department.service';

@Component({
  selector: 'app-department-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './department-details.component.html',
  styleUrl: './department-details.component.scss',
})
export class DepartmentDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);

  readonly department$: Observable<Department | undefined> =
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) =>
        id ? this.departmentService.getDepartmentById(id) : of(undefined)
      )
    );
}

