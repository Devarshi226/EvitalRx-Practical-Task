import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PatientFormComponent } from '../add-patient-form/add-patient-form.component';
import { Router } from '@angular/router';
import { OrderConfirmationComponent } from '../order-confirmation/order-confirmation.component';
import { FirestoreService } from 'src/app/services/database/firestore.service';
import { EvitalApiService } from 'src/app/services/evitalrx/evital-api.service';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit ,OnDestroy{
  checkoutForm!: FormGroup;
  checkout: any;
  item: any[] = [];
  patients: any[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  total: any[] = [];
  isLoading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private fireStoreService: FirestoreService,
    private medicineService: EvitalApiService,
    private sharedDataService: ShareddataService,
    private toast: ToastrService
  ) {
    this.initForm();
    this.loadPatients();
    this.setupSubscriptions();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private setupSubscriptions() {
    this.subscriptions.add(
      this.sharedDataService.cartCheckoutResponse$.subscribe((element) => {
        if (element) {
          ;
          this.checkout = element;
          this.shipping = this.checkout.data?.shipping_charges || 0;
        }
      })
    );



    this.subscriptions.add(
      this.sharedDataService.subtotal$.subscribe((element) => {
        if (element && Array.isArray(element)) {
          this.total = element;
          this.subtotal = this.total.reduce((sum: number, item: any) => {
            return sum + (Number(item.totalprice) || 0);
          }, 0);
        }
      })
    );
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
      longitude: ['77.6382433'],
      patientid: ['']
    });
  }

  onAddPatient() {
    const dialogRef = this.dialog.open(PatientFormComponent, {
      width: '700px',
      height: '600px',
      disableClose: true,
      data: { mode: 'add' }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const newPatient = {
            id: this.patients.length + 1,
            ...result
          };
          this.patients = [...this.patients, newPatient];
          this.checkoutForm.patchValue({
            selectedPatient: newPatient.id
          });
        }
      })
    );
  }


  loadCheckoutFromLocalStorage() {
    const cartData = localStorage.getItem('cartCheckoutResponse');
    if (cartData) {
      this.checkout = JSON.parse(cartData);
    } else {
      this.toast.error('No cart data found in localStorage');
    }
  }

  confirmOrder() {
    if (this.checkoutForm.valid) {
      if (!this.checkout?.data?.items?.length) {
        this.loadCheckoutFromLocalStorage(); // Load data from localStorage if checkout is empty
      }

      if (!this.checkout?.data?.items?.length) {
        this.toast.error('Cart is empty');
        return;
      }

      this.item = this.checkout.data.items
        .filter((ele: any) => ele.medicine_id)
        .map((ele: any) => ({
          medicine_id: ele.medicine_id,
          quantity: 1
        }));

      if (this.item.length === 0) {
        this.toast.error('No valid items in the cart');
        return;
      }

      const orderData = {
        items: JSON.stringify(this.item),
        delivery_type: this.checkoutForm.get('deliveryType')?.value || "delivery",
        patient_name: this.checkoutForm.get('patientName')?.value,
        mobile: this.checkoutForm.get('mobile')?.value,
        address: this.checkoutForm.get('address')?.value,
        city: this.checkoutForm.get('city')?.value,
        state: this.checkoutForm.get('state')?.value,
        zipcode: this.checkoutForm.get('zipcode')?.value,
        auto_assign: this.checkoutForm.get('autoAssign')?.value || true,
        chemist_id: this.checkoutForm.get('chemistId')?.value || null,
        latitude: +this.checkoutForm.get('latitude')?.value || 12.970612,
        longitude: +this.checkoutForm.get('longitude')?.value || 77.6382433,
        patient_id: this.checkoutForm.get('patientid')?.value || null
      };

      this.isLoading = true;

      this.medicineService.placeOrder(orderData).subscribe({
        next: (response) => {
          if (response?.data?.order_id) {
            this.fireStoreService.addOrderToUserCollection(response.data.order_id);
            this.confirmOrderStatusPopUp(response);
            this.toast.success('Order placed successfully!');

            this.checkoutForm.reset({ deliveryType: 'delivery', autoAssign: true });
            this.item = [];

            this.sharedDataService.clearCartCheckoutResponse();
            this.isLoading = false;

            this.backToHome();
          } else {
            this.toast.error('Invalid order response');
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error('Error placing order');
          console.error('Order placement error:', err);
        }
      });
    } else {
      this.markFormGroupTouched(this.checkoutForm);
      this.toast.error('Please fill all required fields');
    }
  }



  backToHome() {
    this.sharedDataService.clearCartCheckoutResponse();
    this.router.navigate(['/pages/dashboard']);
  }

  async loadPatients(): Promise<void> {
    try {
      const patientIds = await this.fireStoreService.retrieveUserPatients();
      const patientPromises = patientIds.map((element: any) =>
        this.medicineService.viewPatient(element).toPromise()
      );
      const patientResponses = await Promise.all(patientPromises);

      this.patients = patientResponses.map((res: any) => ({
        patient_id: res.data[0].patient_id,
        patient_name: res.data[0].firstname,
      }));

      this.initLoad();
    } catch (error) {
      console.error('Error fetching patients:', error);
      this.toast.error('Error loading patients');
    }
  }

  onSelectionChange(event: any) {
    this.sharedDataService.sendPatientId(event.value.patient_id);
    this.checkoutForm.patchValue({
      patientid: event.value.patient_id,
      patientName: event.value.patient_name,
    });
  }

  initLoad(): void {
    if (this.patients.length > 0) {
      this.checkoutForm.patchValue({
        patientName: this.patients[0].patient_name,
        selectedPatient: this.patients[0],
        patientid: this.patients[0].patient_id
      });
      this.sharedDataService.sendPatientId(this.patients[0].patient_id);
    }
  }

  confirmOrderStatusPopUp(data: any) {
    this.dialog.open(OrderConfirmationComponent, {
      data: {
        patientName: this.checkoutForm.get('patientName')?.value,
        data: data ,
        total : this.subtotal + this.shipping
      },
      width: '600px',
      height: 'auto',
      disableClose: true,
      panelClass: 'custom-dialog'
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
