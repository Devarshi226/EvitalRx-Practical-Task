import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';
import { AddPatientFormComponent } from './forms/add-patient-form/add-patient-form.component';
import { SearchComponent } from './search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    PagesComponent,
    DashboardComponent,
    ViewDetailsComponent,
    CartComponent,
    CheckoutComponent,
    OrderConfirmationComponent,
    RecentOrdersComponent,
    AddPatientFormComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PagesModule { }
