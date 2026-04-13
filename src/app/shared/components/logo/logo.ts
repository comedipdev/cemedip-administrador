import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-logo',
  imports: [NgOptimizedImage],
  template: `
    <div class="flex items-center select-none">
      <img
        ngSrc="assets/logo.png"
        alt="CEMEDIP Logo"
        width="2055"
        height="492"
        priority
        class="h-20 w-auto object-contain lg:h-24"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {}
