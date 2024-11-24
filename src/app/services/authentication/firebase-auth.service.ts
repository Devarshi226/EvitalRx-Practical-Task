import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, tap } from 'rxjs';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";



interface AuthCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseAuthService  {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_ID_KEY = 'user_id';
  private currentUser: any;

  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    this.fireAuth.authState.subscribe(user => {
      this.currentUser = user;
    });
  }

  public login(credentials: AuthCredentials): Observable<any> {
    return from(
      this.fireAuth.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      )
    ).pipe(
      tap({
        next: () => {
          this.generateSecureToken();
          this.storeUserEmail(credentials.email);
          this.navigateToDashboard();
        },
        error: (error) => {
          throw new Error(`Authentication failed: ${error.message}`);
        }
      })
    );
  }

  public async register(userData: AuthCredentials): Promise<void> {

    try {

      console.log("data",userData);
      const userCredential = await this.fireAuth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );

      if (userCredential.user?.uid) {
        await this.createUserProfile(userCredential.user.uid, userData);
      }
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  private async createUserProfile(userId: string, userData: AuthCredentials): Promise<void> {

    const userProfile = {
      email: userData.email,
      createdAt: new Date().toISOString(),
    };

    await this.firestore.collection('UserCollection').doc(userId).set(userProfile);
  }

  public initiatePasswordRecovery(email: string): Observable<void> {
    return from(this.fireAuth.sendPasswordResetEmail(email)).pipe(
      tap({
        next: () => {

        },
        error: (error) => {
          throw new Error(`Password recovery failed: ${error.message}`);
        }
      })
    );
  }

  public async socialMediaLogin(provider: any): Promise<any> {
    try {
      const result = await this.fireAuth.signInWithPopup(provider);
      this.generateSecureToken();
      return result.user;
    } catch (error: any) {
      throw new Error(`Social media login failed: ${error.message}`);
    }
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    this.fireAuth.signOut();
    this.router.navigate(['/login']);
  }

  private generateSecureToken(): void {
    const length = 32;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const token = Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(byte => charset[byte % charset.length])
      .join('');

    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUserEmail(email: string): void {
    localStorage.setItem(this.USER_ID_KEY, email);
  }

  private navigateToDashboard(): void {
    setTimeout(() => this.router.navigate(['/pages/dashboard']), 2000);
  }

  public get isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.TOKEN_KEY));
  }
}
