import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgetpass',
  templateUrl: './forgetpass.component.html',
  styleUrls: ['./forgetpass.component.scss']
})
export class ForgetpassComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  resendLoading = false;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.valid) {
      try {
        this.isLoading = true;
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Add your password reset logic here
        console.log('Reset email sent to:', this.forgotPasswordForm.value.email);
        this.emailSent = true;
      } catch (error) {
        console.error('Password reset error:', error);
        // Handle error (show message, etc.)
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

  async resendEmail(): Promise<void> {
    try {
      this.resendLoading = true;
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Add your resend email logic here
      console.log('Reset email resent to:', this.forgotPasswordForm.value.email);
    } catch (error) {
      console.error('Resend email error:', error);
      // Handle error (show message, etc.)
    } finally {
      this.resendLoading = false;
    }
  }
}


