import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-progress-card',
  imports: [ProgressBarModule],
  template: `
    <button
      type="button"
      (click)="cardClick.emit()"
      class="bg-surface-0 border-primary hover:bg-surface-50 border-y-none border-r-none flex w-full cursor-pointer flex-col gap-4 rounded-2xl border-l-8 p-5 text-left shadow-sm transition-all"
    >
      <div class="flex w-full items-center gap-4">
        <div
          class="bg-surface-200 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        >
          <i class="pi pi-chart-line text-surface-500 text-xl"></i>
        </div>

        <div class="flex min-w-0 grow flex-col">
          <h3 class="text-primary-900 truncate text-base font-extrabold tracking-tight uppercase">
            {{ title() }}
          </h3>
          <p class="text-surface-600 truncate text-xs font-bold uppercase">
            {{ specialty() }}, {{ topic() }}
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-end">
          <span class="text-primary-900 text-2xl font-black"> {{ percentage() }}% </span>
        </div>
      </div>

      <div class="w-full">
        <p-progressbar
          [value]="percentage()"
          [showValue]="false"
          [pt]="{ root: { class: 'h-2' } }"
        />
        <div class="mt-2 flex justify-between">
          <span class="text-surface-500 text-[10px] font-medium">
            ÚLTIMA ACTIVIDAD: {{ date() }}
          </span>
        </div>
      </div>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCardComponent {
  readonly title = input.required<string>();
  readonly specialty = input.required<string>();
  readonly topic = input.required<string>();
  readonly date = input.required<string>();
  readonly percentage = input.required<number>();

  readonly cardClick = output<void>();
}
