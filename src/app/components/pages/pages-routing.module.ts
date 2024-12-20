import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [{ path: 'home', component:DashboardComponent },
  {path:'cart',component:CartComponent},
  {path:'checkout', component : CheckoutComponent},
  {path:'orders',component:RecentOrdersComponent},
  {path:'search',component:SearchComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
