import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PatientFormComponent } from '../add-patient-form/add-patient-form.component';
import { Router } from '@angular/router';
import { OrderConfirmationComponent } from '../order-confirmation/order-confirmation.component';
import { FirestoreService } from 'src/app/services/database/firestore.service';
import { EvitalApiService } from 'src/app/services/evitalrx/evital-api.service';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  checkout: any;
  item: any[] = [];
  patients: any[] = [];
  subtotal!: number;
  shipping!: number ;
  total: [] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private fireStroreService: FirestoreService,
    private medicineService: EvitalApiService,
    private sharedDataService : ShareddataService,
    private Firestore: FirestoreService,
    private toast: ToastrService
  ) {
    this.initForm();
    this.loadPatients();
  }

  ngOnInit() {

    this. getdata()
    console.log('checkout', this.checkout);

  }



  getdata() {
    this.sharedDataService.cartCheckoutResponse$.subscribe((element) => {
      if (element) {
        this.checkout = element;
        this.shipping = this.checkout.data?.shipping_charges;
      } else {
      }
    });

    this.sharedDataService.subtotal$.subscribe((element) => {
      if (element) {

        this.total = element;
        const totalPrice = this.total.reduce((sum: number, item: any) => {
          return sum + (item.totalprice || 0);
        }, 0);

        this.subtotal = totalPrice;
      } else {
      }

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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const newPatient: any = {
          id: this.patients.length + 1,
          ...result
        };
        this.patients = [...this.patients, newPatient];

        this.checkoutForm.patchValue({
          selectedPatient: newPatient.id
        });
      }
    });
  }

  confirmOrder(){

    if (this.checkoutForm.valid) {
      this.item = [];

      if (this.checkout?.data?.items?.length) {

        this.checkout.data.items.forEach((ele: any) => {
          if (ele.medicine_id ){
            const item = {
              medicine_id: ele.medicine_id,
              quantity: 1
            };

            this.item.push(item);
          }else{
          }

        });


        const data = {
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


        console.log('data', data);

        this.medicineService.placeOrder(data).subscribe({
          next: (response) => {


            console.log('response', response);
            this.Firestore.addOrderToUserCollection(response.data?.order_id);
            this.confirmOrderStatusPopUp(response)
            this.toast.success('Order placed successfully!');
            this.checkoutForm.reset({ deliveryType: 'delivery', autoAssign: true });
            this.item = [];

          },
          error: (err) => {
            this.toast.error('Error placing order');}
        });
      } else {
      }
    } else {
      Object.values(this.checkoutForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }

  }



  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  backToHome(){
    this.sharedDataService.clearCartData();
    this.sharedDataService.clearCartCheckoutResponse();
    this.router.navigate(['/pages/dashboard']);

  }


  async loadPatients(): Promise<void> {
    try {
      const patientIds = await this.fireStroreService.retrieveUserPatients();
        const patientPromises = patientIds.map((element: any) =>
        this.medicineService.viewPatient(element).toPromise()
      );
        const patientResponses = await Promise.all(patientPromises);

      this.patients = patientResponses.map((res: any) => ({
        patient_id: res.data[0].patient_id,
        patient_name: res.data[0].firstname,
      }));
        this.initLoad();
        console.log("patient", this.patients);

    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }


  onSelectionChange(event: any) {
    this.sharedDataService.updatePatientId(event.value.patient_id);
    this.checkoutForm.patchValue({
      patientid : event.value.patient_id,
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
        this.sharedDataService.updatePatientId(this.patients[0].patient_id);
    }
  }



  confirmOrderStatusPopUp(data:any) {
    if (true) {
      this.dialog.open(OrderConfirmationComponent, {
        data: {
          patientName: this.checkoutForm.get('patientName')?.value,
          data: data
        },
        width: '600px',
        height: 'auto',
        disableClose: true,
        panelClass: 'custom-dialog'
      });
    }
  }
}
