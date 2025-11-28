import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractAccessManagementComponent } from './contract-access-management.component';

describe('ContractAccessManagementComponent', () => {
  let component: ContractAccessManagementComponent;
  let fixture: ComponentFixture<ContractAccessManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractAccessManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractAccessManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
