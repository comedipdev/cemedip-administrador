import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import {
  LoginRequest,
  LoginData,
  User,
  RecoverPasswordRequest,
  ConfirmPasswordRequest,
} from '@core/models/auth.model';
import { ApiSuccessResponse } from '@core/models/api.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(!!this.getStoredToken());

  login(credentials: Omit<LoginRequest, 'aplicacion'>): Observable<ApiSuccessResponse<LoginData>> {
    const request: LoginRequest = {
      ...credentials,
      aplicacion: 'app',
    };

    return this.http
      .post<ApiSuccessResponse<LoginData>>(`${API_BASE_URL}/cliente/seguridad/login/`, request)
      .pipe(
        tap((response) => {
          if (response.status === 'success' && response.data?.token) {
            this.saveSession(response.data.token, response.data.usuario);
          }
        }),
      );
  }

  recoverPassword(
    request: RecoverPasswordRequest,
  ): Observable<ApiSuccessResponse<Record<string, never>>> {
    return this.http.post<ApiSuccessResponse<Record<string, never>>>(
      `${API_BASE_URL}/cliente/seguridad/recuperar-contrasena/`,
      request,
    );
  }

  confirmPassword(
    request: ConfirmPasswordRequest,
  ): Observable<ApiSuccessResponse<Record<string, never>>> {
    return this.http.post<ApiSuccessResponse<Record<string, never>>>(
      `${API_BASE_URL}/cliente/seguridad/confirmar-recuperacion-contrasena/`,
      request,
    );
  }

  logout(): void {
    this.http
      .post<ApiSuccessResponse<Record<string, never>>>(
        `${API_BASE_URL}/cliente/seguridad/logout/`,
        {},
      )
      .pipe(
        finalize(() => {
          this.clearSession();
          this.router.navigate(['/login']);
        }),
      )
      .subscribe();
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}
