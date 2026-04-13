import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-action-card',
  imports: [],
  template: `
    <button
      type="button"
      (click)="cardClick.emit()"
      class="text-surface-0 bg-primary group relative flex w-full cursor-pointer items-center gap-4 rounded-3xl border-none p-6 text-left shadow-xl transition-all hover:brightness-110 active:scale-95"
    >
      <div
        class="bg-surface-0 flex h-20 w-20 shrink-0 items-center justify-center rounded-full shadow-inner"
      >
        <i [class]="icon()" class="text-primary text-4xl"></i>
      </div>

      <span class="grow text-2xl font-black tracking-wider uppercase">
        {{ label() }}
      </span>

      <div class="flex h-12 w-12 items-center justify-center">
        <i class="pi pi-chevron-right text-3xl"></i>
      </div>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCardComponent {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly cardClick = output<void>();
}
