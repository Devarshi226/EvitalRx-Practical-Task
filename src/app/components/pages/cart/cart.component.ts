import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';
import { PatientFormComponent } from '../add-patient-form/add-patient-form.component';
import { Router } from '@angular/router';
import { EvitalApiService } from 'src/app/services/evitalrx/evital-api.service';



@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  tax: number = 0.0;
  total: number = 0.0;
  cartItems: any[] = [];
  finaldata: any[] = [];
  productPrice: any[] = [];
  item: any[] = [];

  get subtotal(): number {
    return this.productPrice.reduce((sum, item) => sum + item.totalprice, 0);
  }

  constructor(private fb: FormBuilder, private sharedData: ShareddataService, private dialog: MatDialog, private router: Router, private medicineService: EvitalApiService) {

  }

  ngOnInit(): void {
    this.getCartData();
  }

  getCartData() {
    this.sharedData.cartData$.subscribe((element) => {
      this.cartItems = element;
      this.productPrice = this.cartItems.map((item) => ({
        id: item.data[0].id,
        totalprice: item.data[0].mrp * (item.quantity || 1)
      }));
      this.updateTotalAndTax();
    });
  }

  clearCart() {
    this.sharedData.clearCartData();
    this.productPrice = [];
    this.updateTotalAndTax();
  }

  quantityChange(item: any, change: number) {
    const updatedQuantity = (item.quantity || 1) + change;
    if (updatedQuantity < 1) return;
    item.quantity = updatedQuantity;

    const productIndex = this.productPrice.findIndex((product) => product.id === item.data[0].id);
    if (productIndex !== -1) {
      this.productPrice[productIndex].totalprice = item.data[0].mrp * updatedQuantity;
    }

    this.sharedData.updateCartData(this.cartItems);
    this.sharedData.updateSubtotal(this.productPrice);
    this.updateTotalAndTax();
  }

  removeItem(itemId: number) {
    this.cartItems = this.cartItems.filter((item) => item.data[0].id !== itemId);
    this.productPrice = this.productPrice.filter((product) => product.id !== itemId);
    this.updateTotalAndTax();
  }

  updateTotalAndTax() {
    this.tax = this.subtotal * 0.18;
    this.total = this.subtotal + this.tax;
  }

  placeOrder(): void {
debugger

      this.cartItems.map(ele => {
        let item = {
         quantity: ele.quantity,
         medicine_id: ele.data[0].id
       }
       this.item.push(item);
     })

     let data = {
       latitude: 12.970612,
       longitude: 77.6382433,
       distance: 5,
       items: JSON.stringify(this.item)
     }

     this.medicineService.checkout(data).subscribe(res => {
       const data = res ;
       this.sharedData.sendCartCheckoutResponse(data);
       this.router.navigate(['/pages/checkout']);
   })

  }
}
