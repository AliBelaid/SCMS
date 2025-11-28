import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPhotoUpdateComponent } from './user-photo-update.component';

describe('UserPhotoUpdateComponent', () => {
  let component: UserPhotoUpdateComponent;
  let fixture: ComponentFixture<UserPhotoUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPhotoUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPhotoUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
