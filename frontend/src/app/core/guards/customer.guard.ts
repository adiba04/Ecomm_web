import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class CustomerGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.authService.ensureSessionHydrated();

    if (!this.authService.isAuthenticated) {
      return this.router.createUrlTree(['/auth/login']);
    }

    return this.authService.currentUser?.role === 'CUSTOMER' ? true : this.router.createUrlTree(['/']);
  }
}
