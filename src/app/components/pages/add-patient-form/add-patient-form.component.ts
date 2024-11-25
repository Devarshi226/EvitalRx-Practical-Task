import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
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
  maxDate: Date = new Date();
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

    if (control.hasError('required')) {
      return `${controlName.replace('_', ' ').toUpperCase()} is required`;
    }

    if (control.hasError('minlength')) {
      return `${controlName.replace('_', ' ').toUpperCase()} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }

    if (control.hasError('pattern')) {
      switch(controlName) {
        case 'mobile':
          return 'Please enter a valid 10-digit mobile number';
        case 'zipcode':
          return 'Please enter a valid zipcode';
        case 'first_name':
        case 'last_name':
          return 'Only alphabets are allowed';
        default:
          return 'Invalid input';
      }
    }

    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.patientForm.invalid) {
      this.toastr.error('Please fill all required fields correctly');
      return;
    }

    try {
      this.isSubmitting = true;
      const formData = {
        ...this.patientForm.value,
        dob: this.formatDate(this.patientForm.value.dob)
      };

      const response = await this.medicineService.addPatient(formData).toPromise();

      if (response) {
        this.sharedService.updatePatientData(true);
        this.medicineService.addPatient(this.patientForm.value).subscribe((response) => {
          this.firestoreService.addPatientToUserCollection(response.data.patient_id);
          this.toastr.success('Patient added successfully');
          this.dialogRef.close(true);
        });
      }

    } catch (error) {
      console.error('Error adding patient:', error);
      this.toastr.error('Failed to add patient. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private ageValidator(control: any) {
    if (!control.value) return null;

    const today = new Date();
    const birthDate = new Date(control.value);
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 1) {
      return { 'underage': true };
    }

    return null;
  }
}
