import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FirebaseAuthService } from 'src/app/services/authentication/firebase-auth.service';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer,
    private auth: FirebaseAuthService,
    private toster :ToastrService,
    private dataService: ShareddataService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });


  }

  ngOnInit(): void {

  }



  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      try {
        this.isLoading = true;
        await new Promise(resolve => setTimeout(resolve, 1500));

        await this.auth.login(this.loginForm.value).subscribe((res) => {

          this.toster.success('Login successful');
          this.loginForm.reset();
          this.dataService.setLoginStatus(true);
          this.router.navigate(['/pages/dashboard']);
        }, error => {
          this.toster.error('Invalid Credentials');
          this.router.navigate(['/auth/login']);
        });

      } catch (error) {
        console.error('Login error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
