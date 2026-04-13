import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/services/auth.service';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  const authServiceMock = {
    login: vi.fn(),
    currentUser: signal(null),
    isAuthenticated: signal(false),
  };

  beforeEach(async () => {
    authServiceMock.login.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: 'home', component: class {} }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    return { fixture, component, router };
  }

  it('should create', () => {
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should initialize the form with empty values', () => {
    const { component } = createComponent();

    expect(component['loginForm'].getRawValue()).toEqual({
      username: '',
      password: '',
    });
  });

  it('should mark the form as touched and avoid submitting when invalid', () => {
    const { component } = createComponent();

    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component['loginForm'].touched).toBe(true);
  });

  it('should call authService.login and navigate to home on success', async () => {
    const { component, router } = createComponent();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    authServiceMock.login.mockReturnValue(
      of({ status: 'success', statusCode: 200, data: { token: 'abc', usuario: null } }),
    );

    component['loginForm'].setValue({
      username: 'test@user.com',
      password: 'password123',
    });

    component.onSubmit();
    await Promise.resolve();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'test@user.com',
      password: 'password123',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    expect(component['isLoading']()).toBe(false);
    expect(component['errorMessage']()).toBeNull();
  });

  it('should show a backend message when login returns a non-success status', () => {
    const { component } = createComponent();

    authServiceMock.login.mockReturnValue(
      of({
        status: 'error',
        statusCode: 400,
        message: 'Credenciales inválidas',
        data: null,
      }),
    );

    component['loginForm'].setValue({
      username: 'test@user.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component['errorMessage']()).toBe('Credenciales inválidas');
    expect(component['isLoading']()).toBe(false);
  });

  it('should show backend error when api returns error payload', () => {
    const { component } = createComponent();

    authServiceMock.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              error: 'Credenciales incorrectas',
              statusCode: 400,
              status: 'error',
            },
          }),
      ),
    );

    component['loginForm'].setValue({
      username: 'test@user.com',
      password: 'bad-password',
    });

    component.onSubmit();

    expect(component['errorMessage']()).toBe('Credenciales incorrectas');
    expect(component['isLoading']()).toBe(false);
  });
});
