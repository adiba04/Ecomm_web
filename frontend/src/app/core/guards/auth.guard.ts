import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.authService.ensureSessionHydrated();
    return this.authService.isAuthenticated ? true : this.router.createUrlTree(['/auth/login']);
  }
}
