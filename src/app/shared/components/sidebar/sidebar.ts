import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  template: `
    <aside
      class="bg-surface-0 flex h-screen flex-shrink-0 flex-col shadow-md transition-all duration-300 overflow-hidden"
      [class]="collapsed() ? 'w-16' : 'w-64'"
    >
      <div class="flex h-16 items-center justify-center border-b border-surface-100 px-3">
        @if (!collapsed()) {
          <img ngSrc="assets/logo.png" alt="CEMEDIP" width="802" height="192" priority
            class="h-10 w-auto object-contain" />
        } @else {
          <img ngSrc="assets/logo.png" alt="CEMEDIP" width="802" height="192" priority
            class="h-8 w-8 object-contain object-left" />
        }
      </div>

      <nav class="flex-1 overflow-y-auto py-4 flex flex-col gap-1">

        <a
          routerLink="/preguntas"
          routerLinkActive="bg-primary/10 text-primary font-semibold"
          [title]="collapsed() ? 'Preguntas' : ''"
          class="flex items-center gap-3 mx-2 px-3 py-3 rounded-xl text-surface-600 transition-colors hover:bg-surface-50 cursor-pointer"
          [class.justify-center]="collapsed()"
        >
          <i class="pi pi-question-circle text-lg flex-shrink-0"></i>
          @if (!collapsed()) { <span class="text-sm">Preguntas</span> }
        </a>

        <div>
          <button
            class="flex w-[calc(100%-16px)] items-center gap-3 mx-2 px-3 py-3 rounded-xl text-surface-600 transition-colors hover:bg-surface-50"
            [class.justify-center]="collapsed()"
            (click)="!collapsed() && toggleSeguridad()"
          >
            <i class="pi pi-shield text-lg flex-shrink-0" [title]="collapsed() ? 'Seguridad' : ''"></i>
            @if (!collapsed()) {
              <span class="flex-1 text-left text-sm">Seguridad</span>
              <i class="pi text-xs transition-transform duration-200"
                [class]="seguridadOpen() ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            }
          </button>

          @if (seguridadOpen() && !collapsed()) {
            <div class="ml-4 flex flex-col gap-1 mt-1">
              <a routerLink="/seguridad/estudiantes" routerLinkActive="text-primary font-semibold bg-primary/5"
                class="flex items-center gap-2 mx-2 px-3 py-2 rounded-xl text-sm text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
                <i class="pi pi-users text-sm"></i>
                Estudiantes
              </a>
              <a routerLink="/seguridad/administradores" routerLinkActive="text-primary font-semibold bg-primary/5"
                class="flex items-center gap-2 mx-2 px-3 py-2 rounded-xl text-sm text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
                <i class="pi pi-user-plus text-sm"></i>
                Administradores
              </a>
              <a routerLink="/seguridad/permisos" routerLinkActive="text-primary font-semibold bg-primary/5"
                class="flex items-center gap-2 mx-2 px-3 py-2 rounded-xl text-sm text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors">
                <i class="pi pi-lock text-sm"></i>
                Permisos
              </a>
            </div>
          }
        </div>

      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly collapsed = input(false);
  protected readonly seguridadOpen = signal(true);

  protected toggleSeguridad() {
    this.seguridadOpen.update((v) => !v);
  }
}
