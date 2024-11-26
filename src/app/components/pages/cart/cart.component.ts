import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';
import { PatientFormComponent } from '../add-patient-form/add-patient-form.component';
import { Router } from '@angular/router';
import { EvitalApiService } from 'src/app/services/evitalrx/evital-api.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit , OnDestroy {
  tax: number = 0.0;
  total: number = 0.0;
  cartItems: any[] = [];
  finaldata: any[] = [];
  productPrice: any[] = [];
  item: any[] = [];
  private subscriptions: Subscription = new Subscription();
  isLoading: boolean = false;

  get subtotal(): number {
    return this.productPrice.reduce((sum, item) => sum + (item.totalprice || 0), 0);
  }

  constructor(
    private fb: FormBuilder,
    private sharedData: ShareddataService,
    private dialog: MatDialog,
    private router: Router,
    private medicineService: EvitalApiService
  ) {}

  ngOnInit(): void {
    this.setupCartSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupCartSubscription(): void {
    this.subscriptions.add(
      this.sharedData.cartCheckoutResponse$.subscribe({
        next: (element) => {
          if (Array.isArray(element)) {
            this.cartItems = element;
            this.updateProductPrices();
            this.updateTotalAndTax();
          } else {
            this.cartItems = [];
            this.productPrice = [];
            this.updateTotalAndTax();
          }
        },
        error: (error) => {
          console.error('Error in cart subscription:', error);
          this.cartItems = [];
          this.productPrice = [];
          this.updateTotalAndTax();
        }
      })
    );
  }

  private updateProductPrices(): void {
    this.productPrice = this.cartItems
      .filter(item => item.data?.[0]?.id)
      .map(item => ({
        id: item.data[0].id,
        totalprice: (item.data[0].mrp || 0) * (item.quantity || 1)
      }));
  }

  clearCart(): void {
    this.sharedData.clearCartCheckoutResponse();
    this.productPrice = [];
    this.updateTotalAndTax();
    this.item = [];
  }

  removeItem(itemId: number): void {
    const updatedItems = this.cartItems.filter(item => item.data[0]?.id !== itemId);
    this.sharedData.sendCartCheckoutResponse(updatedItems);

    this.productPrice = this.productPrice.filter(product => product.id !== itemId);
    this.updateTotalAndTax();
  }

  quantityChange(item: any, change: number): void {
    const updatedQuantity = (item.quantity || 1) + change;
    if (updatedQuantity < 1) return;

    const updatedItems = this.cartItems.map(cartItem => {
      if (cartItem.data[0]?.id === item.data[0]?.id) {
        return { ...cartItem, quantity: updatedQuantity };
      }
      return cartItem;
    });

    const productIndex = this.productPrice.findIndex(
      product => product.id === item.data[0]?.id
    );

    if (productIndex !== -1) {
      this.productPrice[productIndex].totalprice =
        (item.data[0]?.mrp || 0) * updatedQuantity;
    }

    this.sharedData.sendCartCheckoutResponse(updatedItems);
    this.updateTotalAndTax();
    this.sharedData.sendSubtotal(this.productPrice);
  }

  private updateTotalAndTax(): void {
    this.tax = this.subtotal * 0.18;
    this.total = this.subtotal + this.tax;
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      console.warn('Cart is empty');
      return;
    }

    this.isLoading = true;
    this.item = [];

    this.cartItems.forEach(ele => {
      if (ele.data?.[0]?.id) {
        this.item.push({
          quantity: ele.quantity || 1,
          medicine_id: ele.data[0].id
        });
      }
    });

    const checkoutData = {
      latitude: 12.970612,
      longitude: 77.6382433,
      distance: 5,
      items: JSON.stringify(this.item)
    };

    this.medicineService.checkout(checkoutData).subscribe({
      next: (response) => {
        if (response) {
          this.sharedData.sendCartCheckoutResponse(response);
          this.sharedData.sendSubtotal(this.productPrice);
          this.router.navigate(['/pages/checkout']);
        }
      },
      error: (error) => {
        console.error('Checkout error:', error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}



