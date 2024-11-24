import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShareddataService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly CART_CHEKOUT_KEY = 'CART_CHEKOUT_DATA';
  private readonly PATIENT_ID_KEY = 'PATIENT_ID';
  private readonly SUBTOTAL_KEY = 'subtotal';

  constructor() {
    this.initializeCartData();
  }


  // ** Authentication Status **
  private loginStatus = new BehaviorSubject<boolean>(this.getLoginStatus());
  isLoggedIn$ = this.loginStatus.asObservable();

  setLoginStatus(status: boolean): void {
    this.loginStatus.next(status);
  }

  private getLoginStatus(): boolean {
    const TOKEN_KEY = localStorage.getItem(this.TOKEN_KEY);
    return !!TOKEN_KEY;
  }

  // ** Cart Checkout Data **
  private cartDataSubject = new BehaviorSubject<any[]>(this.loadFromLocalStorage(this.CART_CHEKOUT_KEY, []));
  cartData$ = this.cartDataSubject.asObservable();

  updateCartData(cartData: any[]): void {
    this.cartDataSubject.next(cartData);
    this.saveToLocalStorage(this.CART_CHEKOUT_KEY, cartData);
  }

  clearCartData(): void {
    this.cartDataSubject.next([]);
    this.removeFromLocalStorage(this.CART_CHEKOUT_KEY);
  }

  private initializeCartData(): void {
    const storedCartData = this.loadFromLocalStorage(this.CART_CHEKOUT_KEY, []);
    console.log('Stored cart data:', storedCartData);
    this.cartDataSubject.next(storedCartData);
  }

  // ** Patient ID **
  private patientIdSubject = new BehaviorSubject<any>(this.loadFromLocalStorage(this.CART_CHEKOUT_KEY, null));
  patientId$ = this.patientIdSubject.asObservable();

  updatePatientId(patientId: any): void {
    this.patientIdSubject.next(patientId);
    this.saveToLocalStorage(this.CART_CHEKOUT_KEY, patientId);
  }

  clearPatientId(): void {
    this.patientIdSubject.next(null);
    this.removeFromLocalStorage(this.CART_CHEKOUT_KEY);
  }

  // ** Subtotal **
  private subtotalSubject = new BehaviorSubject<any>(this.loadFromLocalStorage(this.SUBTOTAL_KEY, null));
  subtotal$ = this.subtotalSubject.asObservable();

  updateSubtotal(subtotal: any): void {
    this.subtotalSubject.next(subtotal);
    this.saveToLocalStorage(this.SUBTOTAL_KEY, subtotal);
  }

  clearSubtotal(): void {
    this.subtotalSubject.next(null);
    this.removeFromLocalStorage(this.SUBTOTAL_KEY);
  }

  // ** Patient Data **
  private patientSubject = new BehaviorSubject<any>(null);
  patient$ = this.patientSubject.asObservable();

  updatePatientData(patientData: any): void {
    this.patientSubject.next(patientData);
  }

  clearPatientData(): void {
    this.patientSubject.next(null);
  }

  // ** Local Storage Helpers **
  private saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    const storedData = localStorage.getItem(key);
    try {
      return storedData ? JSON.parse(storedData) : defaultValue;
    } catch {
      this.removeFromLocalStorage(key);
      return defaultValue;
    }
  }

  private removeFromLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }
}
