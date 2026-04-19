import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-field',
  imports: [SkeletonModule],
  template: `
    <div class="flex flex-col gap-1.5" [class]="hostClass()">
      <p-skeleton width="5rem" height="0.65rem" borderRadius="4px" />
      <p-skeleton [height]="height()" borderRadius="0.75rem" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonFieldComponent {
  height = input('3.5rem');
  hostClass = input('');
}
