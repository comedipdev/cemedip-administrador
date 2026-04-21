import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-examen-resultados',
  template: `<div class="py-12 text-center text-surface-400">Resultados — próximamente.</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenResultadosComponent {}
