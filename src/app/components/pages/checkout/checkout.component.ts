import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  tax?: number;
}
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {

  checkoutForm: FormGroup;
  tax: number = 0.0;
  total: number = 0.0;
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Medicine 1',
      price: 29.99,
      quantity: 2,
      image: 'assets/medicine-1.jpg',
      category: 'Medicine',
      tax: 2.99
    },
    // Add more items as needed
  ];

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  constructor(private fb: FormBuilder) {
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
    // You can load saved user information here if needed
  }

  placeOrder(): void {
    if (this.checkoutForm.valid) {
      // Handle order submission
      console.log('Order details:', {
        formData: this.checkoutForm.value,
        items: this.cartItems,
        total: this.subtotal
      });
    }
  }

}
