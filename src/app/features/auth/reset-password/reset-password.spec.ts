import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/services/auth.service';
import { ResetPasswordComponent } from './reset-password';

describe('ResetPasswordComponent', () => {
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let component: ResetPasswordComponent;

  const authServiceMock = {
    recoverPassword: vi.fn(),
    confirmPassword: vi.fn(),
  };

  beforeEach(async () => {
    authServiceMock.recoverPassword.mockReset();
    authServiceMock.confirmPassword.mockReset();

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should initialize the form with empty values', () => {
    expect(component['resetForm'].getRawValue()).toEqual({
      email: '',
      password: '',
      confirmPassword: '',
    });
  });

  it('should mark the form as touched and avoid requesting recovery when invalid', () => {
    component.onSubmit();

    expect(authServiceMock.recoverPassword).not.toHaveBeenCalled();
    expect(component['resetForm'].touched).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component['email'];
    emailControl.setValue('invalid-email');
    expect(emailControl.errors?.['email']).toBe(true);

    emailControl.setValue('test@example.com');
    expect(emailControl.errors).toBeNull();
  });

  it('should validate password requirements', () => {
    expect(component['allRequirementsMet']).toBe(false);

    component['resetForm'].patchValue({ password: 'short' });
    expect(component['requirements'][0].met).toBe(false);

    component['resetForm'].patchValue({ password: 'longenough' });
    expect(component['requirements'][0].met).toBe(true);
    expect(component['requirements'][1].met).toBe(false);
    expect(component['requirements'][2].met).toBe(false);

    component['resetForm'].patchValue({ password: 'Longenough1' });
    expect(component['allRequirementsMet']).toBe(true);
  });

  it('should validate password match', () => {
    component['resetForm'].patchValue({
      password: 'Password1!',
      confirmPassword: 'Different1!',
    });

    expect(component['confirmPassword'].errors?.['passwordMismatch']).toBe(true);

    component['resetForm'].patchValue({
      confirmPassword: 'Password1!',
    });

    expect(component['confirmPassword'].errors).toBeNull();
  });

  it('should call recoverPassword on submit and show the verification modal on success', () => {
    authServiceMock.recoverPassword.mockReturnValue(
      of({ status: 'success', statusCode: 200, data: {} }),
    );

    component['resetForm'].patchValue({
      email: 'test@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    component.onSubmit();

    expect(authServiceMock.recoverPassword).toHaveBeenCalledWith({ correo: 'test@example.com' });
    expect(component['showVerificationModal']()).toBe(true);
    expect(component['otpValue']()).toBe('');
    expect(component['errorMessage']()).toBeNull();
    expect(component['isLoading']()).toBe(false);
  });

  it('should show a recover password error when the backend request fails', () => {
    authServiceMock.recoverPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { message: 'Email not found' },
            status: 404,
          }),
      ),
    );

    component['resetForm'].patchValue({
      email: 'test@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    component.onSubmit();

    expect(component['errorMessage']()).toBe('Email not found');
    expect(component['showVerificationModal']()).toBe(false);
    expect(component['isLoading']()).toBe(false);
  });

  it('should call confirmPassword on verify and show the success modal on success', () => {
    authServiceMock.confirmPassword.mockReturnValue(
      of({ status: 'success', statusCode: 200, data: {} }),
    );

    component['resetForm'].patchValue({
      email: 'test@example.com',
      password: 'NewPassword1!',
      confirmPassword: 'NewPassword1!',
    });
    component['otpValue'].set('123456');
    component['showVerificationModal'].set(true);

    component.onVerify();

    expect(authServiceMock.confirmPassword).toHaveBeenCalledWith({
      token: '123456',
      nueva_contrasena: 'NewPassword1!',
    });
    expect(component['showVerificationModal']()).toBe(false);
    expect(component['showSuccessModal']()).toBe(true);
    expect(component['isLoading']()).toBe(false);
  });

  it('should keep the verification modal open when confirmPassword returns a business error', () => {
    authServiceMock.confirmPassword.mockReturnValue(
      of({
        status: 'error',
        statusCode: 400,
        message: 'Código inválido',
        data: {},
      }),
    );

    component['resetForm'].patchValue({
      email: 'test@example.com',
      password: 'NewPassword1!',
      confirmPassword: 'NewPassword1!',
    });
    component['otpValue'].set('123456');
    component['showVerificationModal'].set(true);

    component.onVerify();

    expect(component['showVerificationModal']()).toBe(true);
    expect(component['showSuccessModal']()).toBe(false);
    expect(component['errorMessage']()).toBe('Código inválido');
  });

  it('should navigate to login on success confirmation', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component['showSuccessModal'].set(true);
    component.onSuccessDone();

    expect(component['showSuccessModal']()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should handle the otp timer correctly', () => {
    vi.useFakeTimers();

    component['startTimer']();
    expect(component['secondsRemaining']()).toBe(600);

    vi.advanceTimersByTime(1000);
    expect(component['secondsRemaining']()).toBe(599);

    component['stopTimer']();
    vi.useRealTimers();
  });
});
