import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Question } from './question.model';

@Component({
  selector: 'app-question',
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './question.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  question = input<Question | null>(null);
  loading = input<boolean>(false);
  submitting = input<boolean>(false);
  number = input.required<number>();
  isAnswered = input<boolean>(false);
  selectedOptionId = input<number | null>(null);

  selectOptionChange = output<number>();

  selectOption(optionId: number): void {
    if (this.isAnswered() || this.submitting()) return;
    this.selectOptionChange.emit(optionId);
  }

  getOptionSeverity(optionId: number): 'secondary' | 'success' | 'warn' | 'primary' {
    const question = this.question();
    if (!question) return 'secondary';

    const option = question.options.find((opt) => opt.id === optionId);
    if (!option) return 'secondary';

    const isSelected = optionId === this.selectedOptionId();

    if (!this.isAnswered()) {
      return isSelected ? 'primary' : 'secondary';
    }

    if (option.isCorrect) return 'success';
    if (isSelected && !option.isCorrect) return 'warn';

    return 'secondary';
  }

  getOptionPt() {
    return {
      root: { class: 'h-16 shadow-none border-none' },
      label: { class: 'uppercase tracking-wider font-semibold text-lg' },
    };
  }
}
