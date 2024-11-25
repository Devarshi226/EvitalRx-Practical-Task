import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';
import { PatientFormComponent } from '../add-patient-form/add-patient-form.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  checkoutForm: FormGroup;
  tax: number = 0.0;
  total: number = 0.0;
  cartItems: any[] = [];
  finaldata: any[] = [];
  productPrice: any[] = []; // Holds updated prices for each product

  get subtotal(): number {
    return this.productPrice.reduce((sum, item) => sum + item.totalprice, 0);
  }

  constructor(private fb: FormBuilder, private sharedData: ShareddataService, private dialog: MatDialog, private router: Router) {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      company: [''],
      address: ['', Validators.required],
      apartment: [''],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      saveInfo: [false],
      paymentMethod: ['card', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getCartData();
  }

  getCartData() {
    this.sharedData.cartData$.subscribe((element) => {
      this.cartItems = element;

      // Initialize `productPrice` based on cart data
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
    // Update the quantity
    const updatedQuantity = (item.quantity || 1) + change;
    if (updatedQuantity < 1) return; // Prevent quantity less than 1
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
    this.sharedData.updateCartData(this.cartItems);
    this.updateTotalAndTax();
  }

  updateTotalAndTax() {
    this.tax = this.subtotal * 0.18;
    this.total = this.subtotal + this.tax;
  }

  placeOrder(): void {

    this.router.navigate(['/pages/checkout']);

    // if (this.checkoutForm.valid) {
    //   console.log('Order details:', {
    //     formData: this.checkoutForm.value,
    //     items: this.cartItems,
    //     total: this.subtotal
    //   });
    // }
  }
}
