import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree ,CanActivateFn} from '@angular/router';
import { map, Observable } from 'rxjs';
import { FirebaseAuthService } from '../services/authentication/firebase-auth.service';
import { ShareddataService } from '../services/shareddata/shareddata.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

}


export const authGuard: CanActivateFn = (route, state) => {
 const sharedData = inject(ShareddataService);
 const router = inject(Router);

  return sharedData.isLoggedIn$.pipe(
    map((status: boolean) => {
      if (!status) {
        return router.createUrlTree(['/auth/login']);
      } else {
        return true;
      }
    })
  );


};
