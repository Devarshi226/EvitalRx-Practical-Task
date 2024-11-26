import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { FirestoreService } from 'src/app/services/database/firestore.service';
import { EvitalApiService } from 'src/app/services/evitalrx/evital-api.service';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './add-patient-form.component.html',
  styleUrls: ['./add-patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  maxDate: Date;
  isSubmitting: boolean = false;
  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  constructor(
    private fb: FormBuilder,
    private medicineService: EvitalApiService,
    private toastr: ToastrService,
    private sharedService: ShareddataService,
    private firestoreService: FirestoreService,
    public dialogRef: MatDialogRef<PatientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.addPanelClass('custom-dialog-container');
    dialogRef.disableClose = true;

    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 1);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.patientForm = this.fb.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      mobile: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      zipcode: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{5,6}$')
      ]],
      dob: [null, [Validators.required]],
      gender: ['', [Validators.required]],
      blood_group: ['', [Validators.required]]
    });
  }

  get f() {
    return this.patientForm.controls;
  }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (!control) return '';

    if (control.hasError('required')) {
      return `${this.formatControlName(controlName)} is required`;
    }

    if (control.hasError('minlength')) {
      return `${this.formatControlName(controlName)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }

    if (control.hasError('pattern')) {
      return this.getPatternErrorMessage(controlName);
    }

    return '';
  }

  private formatControlName(name: string): string {
    return name.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private getPatternErrorMessage(controlName: string): string {
    const errorMessages: { [key: string]: string } = {
      mobile: 'Please enter a valid 10-digit mobile number',
      zipcode: 'Please enter a valid zipcode',
      first_name: 'Only alphabets are allowed',
      last_name: 'Only alphabets are allowed'
    };
    return errorMessages[controlName] || 'Invalid input';
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched(this.patientForm);
      this.toastr.error('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    const formData = this.prepareFormData();

    this.medicineService.addPatient(formData).pipe(
      tap(response => {
        if (response?.data?.patient_id) {
          this.sharedService.sendPatient(response.data);
          this.firestoreService.addPatientToUserCollection(response.data.patient_id);
          this.toastr.success('Patient added successfully');
          this.dialogRef.close(response.data);
        } else {
          throw new Error('Invalid response from server');
        }
      }),
      catchError(error => {
        console.error('Error adding patient:', error);
        this.toastr.error(error.error?.message || 'Failed to add patient. Please try again.');
        return throwError(() => error);
      }),
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe();
  }

  private prepareFormData(): any {
    const formValue = this.patientForm.value;
    return {
      ...formValue,
      dob: this.formatDate(formValue.dob)
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    if (!date) return '';

    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
}
