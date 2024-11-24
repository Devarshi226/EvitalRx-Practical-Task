import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree ,CanActivateFn} from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseAuthService } from '../services/authentication/firebase-auth.service';


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
  const loginService = inject(FirebaseAuthService);
  const router = inject(Router);
  if (!loginService.isAuthenticated){
    return router.createUrlTree(['/auth/login']);
  }else {
    return true
  }
};
