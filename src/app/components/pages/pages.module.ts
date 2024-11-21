import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';


@NgModule({
  declarations: [
    PagesComponent,
    DashboardComponent,
    ViewDetailsComponent,
    CartComponent,
    CheckoutComponent,
    OrderConfirmationComponent,
    RecentOrdersComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
