import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import { LoginData, User } from '@core/models/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let httpTestingController: HttpTestingController;
  let router: Router;

  function configureTestingModule(): void {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  function createService(): AuthService {
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    configureTestingModule();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  const mockUser: User = {
    username: 'demo',
    tipo_usuario: 'admin',
    es_administrador: true,
    nombre: 'Demo User',
  };

  it('should be created', () => {
    const service = createService();

    expect(service).toBeDefined();
  });

  it('should initialize auth state from the persisted session', () => {
    localStorage.setItem('auth_token', 'persisted-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));

    const service = createService();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('should ignore malformed persisted user payloads', () => {
    localStorage.setItem('auth_token', 'persisted-token');
    localStorage.setItem('auth_user', '{invalid json');

    const service = createService();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toBeNull();
  });

  it('should post login credentials and persist the session', () => {
    const service = createService();
    const response: ApiSuccessResponse<LoginData> = {
      status: 'success',
      statusCode: 200,
      data: {
        token: 'jwt-token',
        usuario: mockUser,
      },
    };

    service.login({ username: 'demo', password: 'secret' }).subscribe((result) => {
      expect(result).toEqual(response);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem('auth_token')).toBe('jwt-token');
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
    });

    const req = httpTestingController.expectOne(`${API_BASE_URL}/admin/seguridad/login/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'demo', password: 'secret' });
    req.flush(response);
  });

  it('should not persist the session when the login response has no token', () => {
    const service = createService();
    const response: ApiSuccessResponse<LoginData> = {
      status: 'success',
      statusCode: 200,
      data: {
        token: '',
        usuario: mockUser,
      },
    };

    service.login({ username: 'demo', password: 'secret' }).subscribe((result) => {
      expect(result).toEqual(response);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    const req = httpTestingController.expectOne(`${API_BASE_URL}/admin/seguridad/login/`);
    req.flush(response);
  });

  it('should clear the session and navigate to login after a successful logout', async () => {
    const service = createService();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    localStorage.setItem('auth_token', 'persisted-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    service.isAuthenticated.set(true);
    service.currentUser.set(mockUser);

    service.logout();

    const req = httpTestingController.expectOne(`${API_BASE_URL}/admin/seguridad/logout/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({
      status: 'success',
      statusCode: 200,
      data: {},
    } satisfies ApiSuccessResponse<Record<string, never>>);

    await Promise.resolve();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
