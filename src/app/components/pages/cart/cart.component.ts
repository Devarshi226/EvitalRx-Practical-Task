import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';



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

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  constructor(private fb: FormBuilder , private sharedData: ShareddataService) {
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


  getCartData(){
    this.sharedData.cartData$.subscribe((element) => {
      console.log(element);
      this.cartItems = element;

      this.cartItems.forEach((element) => {
        this.finaldata.push({ id : element.data[0].id ,totalprice: element.data[0].mrp });

      });
      this.sharedData.updateSubtotal(this.finaldata);

  });

  }

  clearCart(){
    this.sharedData.clearCartData();
  }

  placeOrder(): void {
    if (this.checkoutForm.valid) {
      console.log('Order details:', {
        formData: this.checkoutForm.value,
        items: this.cartItems,
        total: this.subtotal
      });
    }
  }
}
