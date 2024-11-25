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
import { SearchComponent } from './search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PatientFormComponent } from './add-patient-form/add-patient-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from 'src/app/modules/material/material.module';


@NgModule({
  declarations: [
    PagesComponent,
    DashboardComponent,
    ViewDetailsComponent,
    CartComponent,
    CheckoutComponent,
    OrderConfirmationComponent,
    RecentOrdersComponent,
    SearchComponent,
    PatientFormComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    MatIconModule,


  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PagesModule { }
