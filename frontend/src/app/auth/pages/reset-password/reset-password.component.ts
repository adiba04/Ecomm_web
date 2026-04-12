import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  loading = false;
  error = '';
  message = '';

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { code, newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.authService.resetPassword({ code: String(code), newPassword: String(newPassword) }).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = response.message ?? 'Password reset successful';
        setTimeout(() => this.router.navigate(['/auth/login']), 700);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Failed to reset password';
      }
    });
  }
}
