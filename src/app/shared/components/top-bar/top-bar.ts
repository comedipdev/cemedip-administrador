import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-top-bar',
  imports: [ButtonModule],
  template: `
    <header class="bg-primary flex h-16 flex-shrink-0 items-center justify-between px-4 shadow-md">
      <p-button
        icon="pi pi-bars"
        variant="text"
        rounded
        severity="contrast"
        aria-label="Menú lateral"
        (click)="toggleSidebar.emit()"
        [pt]="{ root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' } }"
      />

      <div class="flex items-center gap-1">
        <!-- <p-button
          icon="pi pi-bell"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Notificaciones"
          [pt]="{ root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' } }"
        />
        <p-button
          icon="pi pi-cog"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Configuración"
          [pt]="{ root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' } }"
        /> -->
        <p-button
          icon="pi pi-sign-out"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Cerrar sesión"
          (click)="logout()"
          [pt]="{ root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' } }"
        />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private authService = inject(AuthService);
  readonly toggleSidebar = output<void>();

  logout() {
    this.authService.logout();
  }
}
