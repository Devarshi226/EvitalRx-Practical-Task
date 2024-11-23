import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnInit {

  isLoggedIn : Boolean = true;

  cartItemsCount:string = '';

  cartItems : boolean = false;

  constructor(private router:Router, private toastr: ToastrService) {

   }

  ngOnInit(): void {
    // this.SharedStatusService.isLoggedIn$.subscribe((status) => {
    //   this.isLoggedIn = status;
    // });

    // this.SharedStatusService.elementSubject$.subscribe((element:any) => {
    //   if (Array.isArray(element)) {
    //     this.cartItemsCount = element.length.toString();
    //   } else {
    //     console.warn('Expected an array from elementSubject$, got:', element);
    //     this.cartItemsCount = '';
    //   }
    // });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateToolbarPosition(), 0);
  }

  routeThePage(page:string) {
    if (page === 'home') {
      this.router.navigate(['/pages/home']);
    } else if (page === 'past-orders') {
      this.router.navigate(['/pages/orders']);
    } else if (page === 'login') {
      this.router.navigate(['/auth/login']);
    } else if (page === 'signup') {
      this.router.navigate(['/auth/register']);
    }else if (page === 'cart') {



      // this.SharedStatusService.elementSubject$.subscribe((element:any) => {

      //   if (element !== null && element !== undefined) {
      //     this.cartItems = true;
      //   } else {
      //     this.cartItems = false
      //   }
      // });

      if(this.cartItems){
        this.router.navigate(['/pages/addtocart']);
      }else{
        this.toastr.warning('Cart is Empty!');
      }
    }

    else {
    }
  }

  logout(){
    // this.SharedStatusService.setLoginStatus(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartCheckoutResponse');
    localStorage.removeItem('patientId');
    localStorage.removeItem('saveSubtotal');
    this.toastr.warning('Logged Out!');
    this.router.navigate(['/auth/login']);

  }



  updateToolbarPosition(): void {
    const headerElement = document.querySelector('.mat-toolbar.mat-primary') as HTMLElement;

    if (!headerElement) {
      return;
    }

    if (!this.isLoggedIn) {
      headerElement.style.position = 'absolute';
    } else {
      headerElement.style.position = 'sticky';
    }
  }


}
