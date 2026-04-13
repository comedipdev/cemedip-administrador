import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

export interface OptionGridItem<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

@Component({
  selector: 'app-option-grid',
  imports: [ButtonModule],
  template: `
    <div
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      role="radiogroup"
      [attr.aria-labelledby]="ariaLabelledBy() || null"
      [attr.aria-label]="ariaLabel() || null"
    >
      @for (option of options(); track trackByValue(option)) {
        <p-button
          type="button"
          [label]="option.label"
          [disabled]="disabled() || option.disabled"
          [pt]="buttonPt(option)"
          [attr.aria-checked]="isSelected(option)"
          [attr.aria-label]="option.label"
          [attr.role]="'radio'"
          (click)="selectOption(option)"
        />
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionGridComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionGridComponent<T> implements ControlValueAccessor {
  readonly options = input.required<readonly OptionGridItem<T>[]>();
  readonly ariaLabelledBy = input<string>();
  readonly ariaLabel = input<string>();
  readonly value = model<T | null>(null);

  private readonly isDisabled = signal(false);

  readonly disabled = computed(() => this.isDisabled());

  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  selectOption(option: OptionGridItem<T>): void {
    if (this.disabled() || option.disabled) {
      return;
    }

    this.value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
  }

  isSelected(option: OptionGridItem<T>): boolean {
    return this.value() === option.value;
  }

  buttonPt(option: OptionGridItem<T>) {
    const isSelected = this.isSelected(option);

    return {
      root: {
        class: [
          'h-18 w-full rounded-2xl border-none p-0 shadow-none transition-colors',
          isSelected
            ? 'bg-primary text-surface-0 hover:bg-primary-600'
            : 'bg-surface-100 text-primary-900 hover:bg-surface-200',
        ],
        style: {
          borderRadius: '1rem',
          borderWidth: '0',
          overflow: 'hidden',
        },
      },
      label: {
        class: 'px-0 text-sm font-medium tracking-[0.06em] uppercase md:text-base',
      },
    };
  }

  trackByValue(option: OptionGridItem<T>): string {
    return String(option.value);
  }

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
