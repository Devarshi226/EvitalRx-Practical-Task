import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientFormComponent } from './add-patient-form.component';

describe('AddPatientFormComponent', () => {
  let component: AddPatientFormComponent;
  let fixture: ComponentFixture<AddPatientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPatientFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
