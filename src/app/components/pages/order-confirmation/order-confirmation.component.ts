import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.addPanelClass('custom-dialog');
  }

  closePopup(): void {
    this.dialogRef.close();
  }
}
