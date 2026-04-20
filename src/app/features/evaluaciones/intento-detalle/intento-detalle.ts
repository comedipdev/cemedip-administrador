import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { QuestionComponent } from '@shared/components/question/question';
import { IntentoHistoryQuestion } from '@core/models/evaluaciones.model';
import { Question } from '@shared/components/question/question.model';

@Component({
  selector: 'app-intento-detalle',
  imports: [DatePipe, RouterLink, ButtonModule, QuestionComponent],
  templateUrl: './intento-detalle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentoDetalleComponent {
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly route = inject(ActivatedRoute);

  private readonly idIntento = toSignal(
    this.route.params.pipe(map((p) => Number(p['id']))),
    { initialValue: NaN },
  );

  readonly detalleResource = rxResource({
    params: () => {
      const id = this.idIntento();
      return id && !isNaN(id) ? { id } : undefined;
    },
    stream: ({ params }) =>
      this.evaluacionesService.getIntentoDetalle(params.id).pipe(map((r) => r.data)),
  });

  readonly detalle = computed(() => this.detalleResource.value());

  formatDuration(duration: string | null | undefined): string {
    if (!duration) return '-';
    const parts = duration.split(':');
    if (parts.length < 3) return duration;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = Math.floor(parseFloat(parts[2]));
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  navClass(hq: IntentoHistoryQuestion): string {
    if (hq.es_sin_responder) return 'border border-surface-300 text-surface-400 bg-white';
    if (hq.es_correcta) return 'bg-teal-500 text-white';
    return 'bg-primary text-white';
  }

  scrollTo(orden: number): void {
    document.getElementById(`pregunta-${orden}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  mapToQuestion(hq: IntentoHistoryQuestion): Question {
    return {
      id: hq.id_pregunta,
      text: hq.enunciado,
      options: hq.alternativas.map((alt) => ({
        id: alt.id_alternativa_intento,
        label: alt.contenido,
        isCorrect: alt.es_correcta ?? false,
        isSelected: alt.es_elegida ?? false,
      })),
      feedback: hq.feedback
        ? { text: hq.feedback.justificacion, source: hq.feedback.fuente }
        : undefined,
    };
  }

  getSelectedOptionId(hq: IntentoHistoryQuestion): number | null {
    return hq.alternativas.find((a) => a.es_elegida)?.id_alternativa_intento ?? null;
  }
}
