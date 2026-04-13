import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import CemedipPreset from '@theme/cemedip-preset';
import CemedipPT from '@theme/cemedip-pt';

export function provideCemedipPrimeNG(): EnvironmentProviders {
  return makeEnvironmentProviders([
    providePrimeNG({
      inputVariant: 'filled',
      ripple: true,
      theme: {
        preset: CemedipPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, components, utilities',
          },
        },
      },
      pt: CemedipPT,
    }),
  ]);
}
