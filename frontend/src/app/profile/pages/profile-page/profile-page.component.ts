import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthUser } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent {
  readonly user$: Observable<AuthUser | null>;
  profileLoading = false;
  passwordLoading = false;
  profileMessage = '';
  passwordMessage = '';
  error = '';

  readonly profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  readonly passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder
  ) {
    this.user$ = this.authService.user$;

    this.user$.subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({ fullName: user.fullName, email: user.email }, { emitEvent: false });
      }
    });

    void this.authService.ensureSessionHydrated();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileLoading = true;
    this.error = '';
    this.profileMessage = '';

    const value = this.profileForm.getRawValue();
    this.authService
      .updateProfile({ fullName: String(value.fullName), email: String(value.email) })
      .subscribe({
        next: (response) => {
          this.profileLoading = false;
          this.profileMessage = response.message ?? 'Profile updated successfully';
        },
        error: (err) => {
          this.profileLoading = false;
          this.error = err?.error?.message ?? 'Failed to update profile';
        }
      });
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.passwordLoading = true;
    this.error = '';
    this.passwordMessage = '';

    this.authService
      .changePassword({
        currentPassword: String(value.currentPassword),
        newPassword: String(value.newPassword)
      })
      .subscribe({
        next: (response) => {
          this.passwordLoading = false;
          this.passwordMessage = response.message ?? 'Password changed successfully';
          this.passwordForm.reset();
        },
        error: (err) => {
          this.passwordLoading = false;
          this.error = err?.error?.message ?? 'Failed to change password';
        }
      });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
