import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-shell',
  imports: [NgOptimizedImage, NgTemplateOutlet],
  template: `
    <div class="app-auth-shell" [class.app-auth-shell-scroll]="scrollable()">
      @if (imagePosition() === 'left') {
        <ng-container [ngTemplateOutlet]="hero"></ng-container>
      }

      <section
        class="app-auth-main"
        [class.app-auth-main-scroll]="scrollable()"
        [class.app-auth-main-center]="centerContent()"
      >
        <div
          class="app-auth-content app-fade-in"
          [class.app-auth-content-md]="contentWidth() === 'md'"
          [class.app-auth-content-lg]="contentWidth() === 'lg'"
        >
          <ng-content />
        </div>
      </section>

      @if (imagePosition() === 'right') {
        <ng-container [ngTemplateOutlet]="hero"></ng-container>
      }
    </div>

    <ng-template #hero>
      <aside class="app-auth-hero" [class.app-auth-hero-scroll]="scrollable()">
        <div
          class="app-auth-hero-frame"
          [class.app-auth-hero-frame-left]="imagePosition() === 'left'"
          [class.app-auth-hero-frame-right]="imagePosition() === 'right'"
        >
          <img
            [ngSrc]="imageSrc()"
            [alt]="imageAlt()"
            fill
            priority
            class="app-auth-hero-image"
            [class.app-auth-hero-image-left]="imagePosition() === 'left'"
          />

          <div
            class="app-auth-hero-overlay"
            [class.app-auth-hero-overlay-left]="imagePosition() === 'left'"
          ></div>
        </div>
      </aside>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {
  readonly imageSrc = input.required<string>();

  readonly imageAlt = input.required<string>();

  readonly imagePosition = input<'left' | 'right'>('right');

  readonly contentWidth = input<'md' | 'lg'>('md');

  readonly centerContent = input(true);

  readonly scrollable = input(false);
}
