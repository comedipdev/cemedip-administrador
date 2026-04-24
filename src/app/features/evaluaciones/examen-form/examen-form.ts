import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-examen-form',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './examen-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenFormComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly idParam = toSignal(
    this.route.params.pipe(map((p) => p['id'] as string | undefined)),
    { initialValue: undefined },
  );

  readonly esNuevo = computed(() => !this.idParam());
  readonly idExamen = computed(() => this.idParam());

  readonly tabs = [
    { label: 'Configuración', slug: 'configuracion' },
    { label: 'Resultados', slug: 'resultados' },
  ];
}
