import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FirebaseAuthService } from 'src/app/services/authentication/firebase-auth.service';

@Component({
  selector: 'app-forgetpass',
  templateUrl: './forgetpass.component.html',
  styleUrls: ['./forgetpass.component.scss']
})
export class ForgetpassComponent implements OnInit , OnDestroy {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  resendLoading = false;

  constructor(private fb: FormBuilder,    private auth: FirebaseAuthService, private router: Router,
    private toster :ToastrService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.valid) {
      try {
        this.isLoading = true;
        await new Promise(resolve => setTimeout(resolve, 1500));
         await this.auth.initiatePasswordRecovery(this.forgotPasswordForm.value.email).subscribe((res) => {
          this.toster.success('Reset email sent');
         } , (error) => {
          this.toster.error('Invalid Email');
         }
          );
        console.log('Reset email sent to:', this.forgotPasswordForm.value.email);
        this.emailSent = true;
      } catch (error) {
        console.error('Password reset error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        const control = this.forgotPasswordForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.forgotPasswordForm.reset();
  }

  async resendEmail(): Promise<void> {
    try {
      this.resendLoading = true;
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Reset email resent to:', this.forgotPasswordForm.value.email);
    } catch (error) {
      console.error('Resend email error:', error);
    } finally {
      this.resendLoading = false;
    }
  }
}


