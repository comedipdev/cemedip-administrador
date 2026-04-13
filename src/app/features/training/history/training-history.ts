import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';

@Component({
  selector: 'app-training-history',
  imports: [RouterLink, ButtonModule, TopBarComponent],
  template: `
    <div class="bg-surface-50 flex min-h-screen flex-col">
      <app-top-bar />

      <main class="grow px-4 py-8 md:px-8 md:py-12">
        <section
          class="bg-surface-0 mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl p-8 shadow-sm"
        >
          <p class="text-primary-300 text-sm font-black tracking-[0.24em] uppercase">Training</p>
          <h1 class="text-primary-900 text-4xl font-black tracking-tight">HISTORIAL</h1>
          <p class="text-surface-700 max-w-2xl text-base leading-7">En construcción...</p>
          <div class="pt-4">
            <p-button
              label="VOLVER"
              variant="outlined"
              severity="secondary"
              routerLink="/training"
            />
          </div>
        </section>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingHistoryComponent {}
