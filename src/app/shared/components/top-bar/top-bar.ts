import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-top-bar',
  imports: [ButtonModule],
  template: `
    <header class="bg-primary flex h-16 items-center justify-between px-4 shadow-md">
      <div class="flex items-center">
        <p-button
          icon="pi pi-bars"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Menú principal"
          [pt]="{
            root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' },
          }"
        />
      </div>

      <div class="flex items-center gap-1">
        <p-button
          icon="pi pi-user"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Perfil de usuario"
          [pt]="{
            root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' },
          }"
        />
        <p-button
          icon="pi pi-sign-out"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Cerrar sesión"
          (click)="logout()"
          [pt]="{
            root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' },
          }"
        />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
