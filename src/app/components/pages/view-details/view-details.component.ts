import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss']
})

  export class ViewDetailsComponent {
    constructor(
      public dialogRef: MatDialogRef<ViewDetailsComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      dialogRef.addPanelClass('custom-dialog-container');
      // dialogRef.disableClose = true;
      console.log('Data:', data);
    }


    onImageError(event: any): void {
      event.target.src = 'assets/images/default-medicine.png';
    }

    addToCart(): void {
      console.log('Adding to cart:', this.data);
      this.dialogRef.close({ action: 'add_to_cart' });
    }
  }
