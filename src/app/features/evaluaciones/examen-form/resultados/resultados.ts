import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ExamenResultadoIntento, ExamenResultadosData } from '@core/models/evaluaciones.model';

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

const EMPTY: ExamenResultadosData = { preguntas: [], intentos: [] };

const ESTADO_LABELS: Record<string, string> = {
  finalizado: 'Finalizado',
  en_progreso: 'En progreso',
  vencido: 'Vencido',
};

const ESTADO_CLASSES: Record<string, string> = {
  finalizado: 'bg-green-500',
  en_progreso: 'bg-blue-500',
  vencido: 'bg-orange-400',
};

const RANGO_LABELS = [
  '0%-10%', '10%-20%', '20%-30%', '30%-40%', '40%-50%',
  '50%-60%', '60%-70%', '70%-80%', '80%-90%', '90%-100%',
];

const RANGO_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#a3e635',
  '#4ade80', '#34d399', '#22c55e', '#16a34a', '#15803d',
];

@Component({
  selector: 'app-examen-resultados',
  imports: [],
  templateUrl: './resultados.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenResultadosComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly evaluacionesService = inject(EvaluacionesService);

  protected readonly resultadosResource = rxResource({
    stream: () => {
      const idStr = this.route.parent?.snapshot.paramMap.get('id');
      if (!idStr) return of(EMPTY);
      return this.evaluacionesService.getResultadosExamen(Number(idStr)).pipe(
        map((r) => r.data),
        catchError(() => of(EMPTY)),
      );
    },
  });

  protected readonly data = computed(() => this.resultadosResource.value() ?? EMPTY);
  protected readonly preguntas = computed(() => this.data().preguntas);
  protected readonly intentos = computed(() => this.data().intentos);
  protected readonly isLoading = computed(() => this.resultadosResource.isLoading());
  protected readonly totalResultadosFinales = computed(
    () => this.intentos().filter((r) => r.es_ultimo_intento).length,
  );

  private readonly canvasSignal = signal<HTMLCanvasElement | null>(null);
  private chart?: Chart;

  @ViewChild('graficoCanvas')
  set canvasRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    if (!el?.nativeElement) {
      this.chart?.destroy();
      this.chart = undefined;
    }
    this.canvasSignal.set(el?.nativeElement ?? null);
  }

  private readonly rangosData = computed(() => {
    const rangos = Array(10).fill(0) as number[];
    for (const r of this.intentos()) {
      if (!r.es_ultimo_intento || r.porcentaje == null) continue;
      const pct = parseFloat(r.porcentaje);
      if (!isNaN(pct)) rangos[Math.min(Math.floor(pct / 10), 9)]++;
    }
    return rangos;
  });

  constructor() {
    effect(() => {
      const canvas = this.canvasSignal();
      const data = this.rangosData();

      if (!canvas) return;

      if (this.chart) {
        this.chart.data.datasets[0].data = data;
        this.chart.update();
        return;
      }

      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: RANGO_LABELS,
          datasets: [
            {
              label: 'Estudiantes',
              data,
              backgroundColor: RANGO_COLORS,
              borderColor: RANGO_COLORS,
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.parsed.y} estudiante${ctx.parsed.y !== 1 ? 's' : ''}`,
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Rango de calificación' },
              grid: { display: false },
            },
            y: {
              title: { display: true, text: 'Número de estudiantes' },
              beginAtZero: true,
              ticks: { stepSize: 1, precision: 0 },
            },
          },
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected estadoLabel(estado: string): string {
    return ESTADO_LABELS[estado] ?? estado;
  }

  protected estadoClass(estado: string): string {
    return ESTADO_CLASSES[estado] ?? 'bg-surface-400';
  }

  protected getRespuesta(
    r: ExamenResultadoIntento,
    preguntaId: number,
  ): 'correcta' | 'incorrecta' | 'sin_responder' {
    return r.respuestas[String(preguntaId)] ?? 'sin_responder';
  }
}
