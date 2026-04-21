import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-examen-cuestionario',
  template: `<div class="py-12 text-center text-surface-400">Cuestionario — próximamente.</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenCuestionarioComponent {}
