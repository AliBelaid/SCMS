import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Department } from '../../models/department.model';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './departments-list.component.html',
  styleUrl: './departments-list.component.scss',
})
export class DepartmentsListComponent {
  private readonly departmentService = inject(DepartmentService);

  readonly departments$: Observable<Department[]> =
    this.departmentService.getAllDepartments();
}

