import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPermissionsComponent } from './order-permissions.component';

describe('OrderPermissionsComponent', () => {
  let component: OrderPermissionsComponent;
  let fixture: ComponentFixture<OrderPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPermissionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
