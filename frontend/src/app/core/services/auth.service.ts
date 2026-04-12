import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiEnvelope, AuthUser } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  private hasHydratedSession = false;
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  register(payload: { fullName: string; email: string; password: string }): Observable<ApiEnvelope<{ user: AuthUser }>> {
    return this.http.post<ApiEnvelope<{ user: AuthUser }>>(`${this.baseUrl}/register`, payload, {
      withCredentials: true
    });
  }

  login(payload: { email: string; password: string }): Observable<ApiEnvelope<{ user: AuthUser }>> {
    return this.http
      .post<ApiEnvelope<{ user: AuthUser }>>(`${this.baseUrl}/login`, payload, {
        withCredentials: true
      })
      .pipe(
        tap((response) => {
          this.userSubject.next(response.data.user);
          this.hasHydratedSession = true;
        })
      );
  }

  logout(): Observable<ApiEnvelope<unknown>> {
    return this.http.post<ApiEnvelope<unknown>>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.userSubject.next(null);
        this.hasHydratedSession = true;
        this.router.navigate(['/auth/login']);
      })
    );
  }

  handleUnauthorized(): void {
    this.userSubject.next(null);
    this.hasHydratedSession = true;

    if (!this.router.url.startsWith('/auth/login')) {
      this.router.navigate(['/auth/login']);
    }
  }

  forgotPassword(payload: { email: string }): Observable<ApiEnvelope<{ code: string | null; expiresInMinutes: number | null }>> {
    return this.http.post<ApiEnvelope<{ code: string | null; expiresInMinutes: number | null }>>(
      `${this.baseUrl}/forgot-password`,
      payload,
      { withCredentials: true }
    );
  }

  resetPassword(payload: { code: string; newPassword: string }): Observable<ApiEnvelope<unknown>> {
    return this.http.post<ApiEnvelope<unknown>>(`${this.baseUrl}/reset-password`, payload, { withCredentials: true });
  }

  updateProfile(payload: { fullName?: string; email?: string }): Observable<ApiEnvelope<{ user: AuthUser }>> {
    return this.http.patch<ApiEnvelope<{ user: AuthUser }>>(`${this.baseUrl}/me`, payload, { withCredentials: true }).pipe(
      tap((response) => {
        this.userSubject.next(response.data.user);
      })
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<ApiEnvelope<unknown>> {
    return this.http.post<ApiEnvelope<unknown>>(`${this.baseUrl}/change-password`, payload, { withCredentials: true }).pipe(
      tap(() => {
        this.userSubject.next(null);
        this.hasHydratedSession = true;
      })
    );
  }

  async ensureSessionHydrated(): Promise<void> {
    if (this.hasHydratedSession) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiEnvelope<{ user: AuthUser }>>(`${this.baseUrl}/me`, { withCredentials: true })
      );
      this.userSubject.next(response.data.user);
    } catch {
      this.userSubject.next(null);
    } finally {
      this.hasHydratedSession = true;
    }
  }
}
