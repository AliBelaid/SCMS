import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HCPCSService } from '../../../hcpcs/services/hcpcs.service';
import { HCPCSCode } from '../../../hcpcs/models/hcpcs.models';

@Component({
  selector: 'app-hcpcs-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './hcpcs-view.component.html',
  styleUrls: ['./hcpcs-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HCPCSViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hcpcsService = inject(HCPCSService);

  code$!: Observable<HCPCSCode>;

  ngOnInit(): void {
    this.code$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') ?? '';
        return this.hcpcsService.getById(id);
      })
    );
  }
}

