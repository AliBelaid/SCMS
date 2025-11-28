import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddParentComponent } from 'src/app/members/add-parent/add-parent.component';


describe('AddParentComponent', () => {
  let component: AddParentComponent;
  let fixture: ComponentFixture<AddParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
