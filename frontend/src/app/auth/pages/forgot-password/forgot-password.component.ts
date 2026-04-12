import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  loading = false;
  error = '';
  message = '';
  resetCode: string | null = null;
  expiresInMinutes: number | null = null;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';
    this.resetCode = null;
    this.expiresInMinutes = null;

    this.authService.forgotPassword({ email: String(this.form.value.email) }).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = response.message ?? 'If the account exists, a reset code has been generated.';
        this.resetCode = response.data.code;
        this.expiresInMinutes = response.data.expiresInMinutes;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Failed to generate reset code';
      }
    });
  }
}
