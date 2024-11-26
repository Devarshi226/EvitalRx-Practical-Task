import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShareddataService {
  private readonly TOKEN_KEY = 'token';
  private readonly CART_CHECKOUT_KEY = 'cartCheckoutResponse';
  private readonly PATIENT_ID_KEY = 'patientId';
  private readonly SUBTOTAL_KEY = 'saveSubtotal';
  cartData$: any;

  constructor() {
    const storedCartData = this.loadFromLocalStorage(this.CART_CHECKOUT_KEY, []);
    this.cartDataSubject.next(storedCartData);
    this.elementSubject.next(storedCartData);

  }

  // ** Authentication Status **
  private loginStatusSubject = new BehaviorSubject<boolean>(this.getLoginStatus());
  isLoggedIn$ = this.loginStatusSubject.asObservable();

  setLoginStatus(status: boolean): void {
    this.loginStatusSubject.next(status);
  }

  get IsLoggedIn(): boolean {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  private getLoginStatus(): boolean {
    return this.IsLoggedIn;
  }

  // ** Cart Data and Element Subject (matching original service structure) **
  private elementSubject = new BehaviorSubject<any>(null);
  elementSubject$ = this.elementSubject.asObservable();

  sendElement(element: any): void {
    this.elementSubject.next(element);
    this.saveToLocalStorage(this.CART_CHECKOUT_KEY, element);
  }

  ClearCart(): void {
    this.elementSubject.next(null);
    this.clearCartData();
  }

  private cartDataSubject = new BehaviorSubject<any[]>(this.loadFromLocalStorage(this.CART_CHECKOUT_KEY, []));
  cartCheckoutResponse$ = this.cartDataSubject.asObservable();

  sendCartCheckoutResponse(response: any[]): void {
    this.cartDataSubject.next(response);
    this.saveToLocalStorage(this.CART_CHECKOUT_KEY, response);
  }

  clearCartCheckoutResponse(): void {
    this.cartDataSubject.next([]);
    this.removeFromLocalStorage(this.CART_CHECKOUT_KEY);
  }

  // ** Patient ID **
  private patientIdSubject = new BehaviorSubject<any>(this.loadFromLocalStorage(this.PATIENT_ID_KEY, null));
  patientId$ = this.patientIdSubject.asObservable();

  sendPatientId(patientId: any): void {
    this.patientIdSubject.next(patientId);
    this.saveToLocalStorage(this.PATIENT_ID_KEY, patientId);
  }

  // ** Subtotal **
  private subtotalSubject = new BehaviorSubject<any>(this.loadFromLocalStorage(this.SUBTOTAL_KEY, null));
  subtotal$ = this.patientIdSubject.asObservable(); // Fixed to match original behavior

  sendSubtotal(subtotal: any): void {
    this.patientIdSubject.next(subtotal); // Fixed to match original behavior
    this.saveToLocalStorage(this.SUBTOTAL_KEY, subtotal);
  }

  // ** Patient Data **
  private patientSubject = new BehaviorSubject<any>(null);
  patient$ = this.patientSubject.asObservable();

  sendPatient(patientData: any): void {
    this.patientSubject.next(patientData);
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

  private clearCartData(): void {
    this.removeFromLocalStorage(this.CART_CHECKOUT_KEY);
  }
}
