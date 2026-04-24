import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ExamenResultadoIntento } from '@core/models/evaluaciones.model';

const ESTADO_LABELS: Record<string, string> = {
  finalizado: 'Finalizado',
  en_progreso: 'En progreso',
  vencido: 'Vencido',
};

const ESTADO_CLASSES: Record<string, string> = {
  finalizado: 'bg-green-500',
  en_progreso: 'bg-blue-500',
  vencido: 'bg-red-500',
};

@Component({
  selector: 'app-examen-resultados',
  imports: [DatePipe],
  templateUrl: './resultados.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenResultadosComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly evaluacionesService = inject(EvaluacionesService);

  protected readonly resultadosResource = rxResource({
    stream: () => {
      const idStr = this.route.parent?.snapshot.paramMap.get('id');
      if (!idStr) return of([] as ExamenResultadoIntento[]);
      return this.evaluacionesService.getResultadosExamen(Number(idStr)).pipe(
        map((r) => r.data),
        catchError(() => of([] as ExamenResultadoIntento[])),
      );
    },
  });

  protected readonly resultados = computed(() => this.resultadosResource.value() ?? []);
  protected readonly isLoading = computed(() => this.resultadosResource.isLoading());
  protected readonly totalResultadosFinales = computed(
    () => this.resultados().filter((r) => r.es_ultimo_intento).length,
  );

  protected estadoLabel(estado: string): string {
    return ESTADO_LABELS[estado] ?? estado;
  }

  protected estadoClass(estado: string): string {
    return ESTADO_CLASSES[estado] ?? 'bg-surface-400';
  }
}
