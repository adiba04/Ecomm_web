import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  readonly user$: Observable<AuthUser | null>;

  constructor(private readonly authService: AuthService) {
    this.user$ = this.authService.user$;
    void this.authService.ensureSessionHydrated();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get isCustomer(): boolean {
    return this.authService.currentUser?.role === 'CUSTOMER';
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
