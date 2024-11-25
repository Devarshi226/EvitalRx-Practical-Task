import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface OrderConfirmationData {
  patientName: string;
  data: {
    order_id: string;
    order_number: string;
    pharmacy_name: string;
    thankyou_msg_second: string;
    subtotal: number;
    shipping: number;
    total: number;
    delivery_address: string;
    delivery_type: string;
  };
}
@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderConfirmationData
  ) {}

  closePopup(): void {
    this.dialogRef.close();
  }
}
