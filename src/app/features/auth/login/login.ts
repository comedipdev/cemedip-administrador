import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { LogoComponent } from '@shared/components/logo/logo';
import { AuthShellComponent } from '@shared/components/auth-shell/auth-shell';
import { FormFieldComponent } from '@shared/components/form-field/form-field';
import { AuthService } from '@core/services/auth.service';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    LogoComponent,
    FormFieldComponent,
    AuthShellComponent,
    RouterLink,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  protected get username() {
    return this.loginForm.controls.username;
  }

  protected get password() {
    return this.loginForm.controls.password;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { username, password } = this.loginForm.getRawValue();

      this.authService.login({ username, password }).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.router.navigate(['/home']);
          } else {
            this.errorMessage.set(response.message || 'Error al iniciar sesión');
          }
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(extractApiErrorMessage(err));
          this.isLoading.set(false);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
