import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PatientFormComponent } from '../add-patient-form/add-patient-form.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  patients: any[] = [];
  subtotal: number = 2499;
  shipping: number = 100;
  total: number = 0;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.initForm();
    this.calculateTotal();
  }

  ngOnInit() {
    this.loadPatients();

    // Subscribe to form value changes to update patient details
    this.checkoutForm.get('selectedPatient')?.valueChanges.subscribe(patientId => {
      if (patientId) {
        this.loadPatientDetails(patientId);
      } else {
        this.resetForm();
      }
    });

    // Subscribe to delivery type changes to update shipping
    this.checkoutForm.get('deliveryType')?.valueChanges.subscribe(type => {
      this.shipping = type === 'delivery' ? 100 : 0;
      this.calculateTotal();
    });
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      selectedPatient: ['', Validators.required],
      patientName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      deliveryType: ['delivery', Validators.required],
      autoAssign: [true],
      chemistId: [''],
      latitude: ['12.970612'],
      longitude: ['77.6382433']
    });
  }

  private loadPatients() {
    // Simulate API call to load patients
    // In real application, this would be a service call
    this.isLoading = true;
    try {
      this.patients = [
        {
          id: 1,
          name: 'John Doe',
          mobile: '9876543210',
          address: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipcode: '400001'
        },
        {
          id: 2,
          name: 'Jane Smith',
          mobile: '9876543211',
          address: '456 Park Ave',
          city: 'Bangalore',
          state: 'Karnataka',
          zipcode: '560001'
        }
      ];
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private loadPatientDetails(patientId: number) {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      this.checkoutForm.patchValue({
        patientName: patient.name,
        mobile: patient.mobile,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zipcode: patient.zipcode
      });
    }
  }

  private resetForm() {
    this.checkoutForm.patchValue({
      patientName: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      zipcode: ''
    });
  }

  private calculateTotal() {
    this.total = this.subtotal + this.shipping;
  }

  onAddPatient() {
    const dialogRef = this.dialog.open(PatientFormComponent, {
      width: '600px',
      disableClose: true,
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simulate adding new patient to the list
        const newPatient: any = {
          id: this.patients.length + 1,
          ...result
        };
        this.patients = [...this.patients, newPatient];

        // Select the newly added patient
        this.checkoutForm.patchValue({
          selectedPatient: newPatient.id
        });
      }
    });
  }

  confirmOrder() {
    if (this.checkoutForm.valid) {
      this.isLoading = true;

      // Create order payload
      const orderData = {
        ...this.checkoutForm.value,
        orderTotal: this.total,
        subtotal: this.subtotal,
        shipping: this.shipping,
        orderDate: new Date(),
        status: 'pending'
      };

      // Simulate API call to submit order
      try {
        console.log('Submitting order:', orderData);
        // Here you would typically make an API call to submit the order

        // Simulate successful order submission
        setTimeout(() => {
          this.handleOrderSuccess();
        }, 1500);
      } catch (error) {
        console.error('Error submitting order:', error);
        this.handleOrderError(error);
      }
    } else {
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  private handleOrderSuccess() {
    this.isLoading = false;
    // Here you might want to show a success message
    // and navigate to an order confirmation page
    this.router.navigate(['/order-success']);
  }

  private handleOrderError(error: any) {
    this.isLoading = false;
    // Here you might want to show an error message to the user
    console.error('Order submission failed:', error);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getter methods for template access
  get formControls() {
    return this.checkoutForm.controls;
  }

  get isDelivery() {
    return this.checkoutForm.get('deliveryType')?.value === 'delivery';
  }

  get showChemistId() {
    return !this.checkoutForm.get('autoAssign')?.value;
  }
}
