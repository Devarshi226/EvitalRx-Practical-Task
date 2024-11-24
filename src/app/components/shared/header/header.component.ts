import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnInit {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly CART_CHEKOUT_KEY = 'CART_CHEKOUT_DATA';
  private readonly PATIENT_ID_KEY = 'PATIENT_ID';
  private readonly SUBTOTAL_KEY = 'subtotal';
  private readonly USER_ID_KEY = 'user_id';

  LoggedInStatus : Boolean = false;

  cartItemsCount:string = '';

  cartItems : boolean = false;

  constructor(private router:Router, private toastr: ToastrService , private sharedData : ShareddataService) {

    this.sharedData.isLoggedIn$.subscribe((status:boolean) => {
      this.LoggedInStatus = status;
    });

    this.sharedData.cartData$.subscribe((element:any) => {

      if (Array.isArray(element)) {
        console.log('element',element);
        this.cartItemsCount = element.length.toString();
        console.log('cartItemsCount',this.cartItemsCount);
      } else if(element.legnth === 0) {
        console.warn('Expected an array from elementSubject$, got:', element);
        this.cartItemsCount = '';
      }
    });

   }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  routeThePage(page:string) {
    if (page === 'home') {
      this.router.navigate(['/pages/home']);
    } else if (page === 'past-orders') {
      this.router.navigate(['/pages/orders']);
    }



  }

  logout(){
    this.sharedData.setLoginStatus(false);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.CART_CHEKOUT_KEY);
    localStorage.removeItem(this.PATIENT_ID_KEY);
    localStorage.removeItem(this.SUBTOTAL_KEY);
    this.toastr.warning('Logged Out!');
    this.router.navigate(['/auth/login']);

  }







}
