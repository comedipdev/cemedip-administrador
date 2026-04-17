import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@shared/components/sidebar/sidebar';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, SidebarComponent, TopBarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-surface-50">

      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-40 bg-black/40 lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <app-sidebar
        [open]="sidebarOpen()"
        (navItemClick)="onNavItemClick()"
      />

      <div class="flex flex-1 flex-col overflow-hidden">
        <app-top-bar (toggleSidebar)="sidebarOpen.update((v) => !v)" />
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  protected readonly sidebarOpen = signal(true);

  protected onNavItemClick() {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }
}
