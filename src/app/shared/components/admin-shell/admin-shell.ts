import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@shared/components/sidebar/sidebar';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, SidebarComponent, TopBarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-surface-50">
      <app-sidebar [collapsed]="sidebarCollapsed()" />
      <div class="flex flex-1 flex-col overflow-hidden">
        <app-top-bar (toggleSidebar)="sidebarCollapsed.update((v) => !v)" />
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  protected readonly sidebarCollapsed = signal(false);
}
