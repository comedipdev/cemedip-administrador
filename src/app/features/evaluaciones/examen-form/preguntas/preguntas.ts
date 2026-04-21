import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-examen-preguntas',
  template: `<div class="py-12 text-center text-surface-400">Preguntas — próximamente.</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenPreguntasComponent {}
