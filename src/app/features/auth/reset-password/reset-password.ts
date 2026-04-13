import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { AuthShellComponent } from '@shared/components/auth-shell/auth-shell';
import { FormFieldComponent } from '@shared/components/form-field/form-field';
import { AuthService } from '@core/services/auth.service';
import { extractApiErrorMessage } from '@core/models/api.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  const currentErrors = confirmPassword.errors ?? {};

  if (password.value !== confirmPassword.value) {
    if (!currentErrors['passwordMismatch']) {
      confirmPassword.setErrors({ ...currentErrors, passwordMismatch: true });
    }

    return { passwordMismatch: true };
  }

  if (currentErrors['passwordMismatch']) {
    const remainingErrors = { ...currentErrors };
    delete remainingErrors['passwordMismatch'];
    confirmPassword.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
  }

  return null;
}

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PasswordModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    InputOtpModule,
    AuthShellComponent,
    FormFieldComponent,
    RouterLink,
  ],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnDestroy {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Estados del modal y OTP
  protected readonly showVerificationModal = signal(false);
  protected readonly showSuccessModal = signal(false);
  protected readonly otpValue = signal('');
  protected readonly secondsRemaining = signal(600); // 10 minutos
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  protected readonly timerText = computed(() => {
    const mins = Math.floor(this.secondsRemaining() / 60);
    const secs = this.secondsRemaining() % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min.`;
  });

  protected readonly resetForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  protected get email() {
    return this.resetForm.controls.email;
  }

  protected get password() {
    return this.resetForm.controls.password;
  }

  protected get confirmPassword() {
    return this.resetForm.controls.confirmPassword;
  }

  protected get requirements() {
    const val = this.password.value;
    return [
      { label: 'Tener al menos 8 caracteres.', met: val.length >= 8 },
      { label: 'Tener una letra Mayúscula.', met: /[A-Z]/.test(val) },
      { label: 'Tener un número o símbolo.', met: /[0-9!@#$%^&*(),.?":{}|<>]/.test(val) },
    ];
  }

  protected get allRequirementsMet() {
    return this.requirements.every((req) => req.met);
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  onSubmit() {
    if (this.resetForm.valid && this.allRequirementsMet) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { email } = this.resetForm.getRawValue();

      this.authService.recoverPassword({ correo: email }).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.otpValue.set('');
            this.errorMessage.set(null);
            this.showVerificationModal.set(true);
            this.startTimer();
          } else {
            this.errorMessage.set(response.message || 'Error al solicitar el código');
          }
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(extractApiErrorMessage(err));
          this.isLoading.set(false);
        },
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  onVerify() {
    if (this.otpValue().length === 6) {
      this.isLoading.set(true);
      const { password } = this.resetForm.getRawValue();

      this.authService
        .confirmPassword({
          token: this.otpValue(),
          nueva_contrasena: password,
        })
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.showVerificationModal.set(false);
              this.showSuccessModal.set(true);
            } else {
              this.errorMessage.set(response.message || 'Error al verificar el código');
              // No cerramos el modal para permitir reintentar
            }
            this.isLoading.set(false);
          },
          error: (err: HttpErrorResponse) => {
            this.errorMessage.set(extractApiErrorMessage(err));
            this.isLoading.set(false);
          },
        });
    }
  }

  onSuccessDone() {
    this.showSuccessModal.set(false);
    this.router.navigate(['/login']);
  }

  protected startTimer() {
    this.secondsRemaining.set(600);
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.secondsRemaining.update((s) => (s > 0 ? s - 1 : 0));
      if (this.secondsRemaining() === 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  protected stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
