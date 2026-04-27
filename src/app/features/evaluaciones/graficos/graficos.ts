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
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
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

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

const PERIODO_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

function formatTiempo(segundos: number): string {
  if (segundos <= 0) return '0m';
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

function nombreCompleto(nombres: string, apellidos: string): string {
  const a = apellidos?.trim();
  const n = nombres?.trim();
  if (a && n) return `${a}, ${n}`;
  return a || n || '(sin nombre)';
}

@Component({
  selector: 'app-graficos',
  imports: [],
  templateUrl: './graficos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficosComponent implements OnDestroy {
  private readonly evaluacionesService = inject(EvaluacionesService);

  protected readonly graficosResource = rxResource({
    stream: () => this.evaluacionesService.getGraficos().pipe(map((r) => r.data)),
  });

  protected readonly isLoading = computed(() => this.graficosResource.isLoading());
  protected readonly data = computed(() => this.graficosResource.value() ?? null);
  protected readonly hoy = computed(() => this.data()?.periodos[0] ?? null);
  protected readonly selectedPeriodo = signal(0);

  protected readonly formatTiempo = formatTiempo;

  // Canvas signals
  private readonly preguntasCanvasSignal = signal<HTMLCanvasElement | null>(null);
  private readonly intentosCanvasSignal = signal<HTMLCanvasElement | null>(null);
  private readonly tiempoCanvasSignal = signal<HTMLCanvasElement | null>(null);
  private readonly practicanteCanvasSignal = signal<HTMLCanvasElement | null>(null);
  private readonly rendimientoCanvasSignal = signal<HTMLCanvasElement | null>(null);
  private readonly especialidadCanvasSignal = signal<HTMLCanvasElement | null>(null);

  @ViewChild('preguntasCanvas') set preguntasRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    this.preguntasCanvasSignal.set(el?.nativeElement ?? null);
  }
  @ViewChild('intentosCanvas') set intentosRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    this.intentosCanvasSignal.set(el?.nativeElement ?? null);
  }
  @ViewChild('tiempoCanvas') set tiempoRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    this.tiempoCanvasSignal.set(el?.nativeElement ?? null);
  }
  @ViewChild('practicanteCanvas') set practicanteRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    this.practicanteCanvasSignal.set(el?.nativeElement ?? null);
  }
  @ViewChild('rendimientoCanvas') set rendimientoRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    this.rendimientoCanvasSignal.set(el?.nativeElement ?? null);
  }
  @ViewChild('especialidadCanvas') set especialidadRef(el: ElementRef<HTMLCanvasElement> | undefined) {
    this.especialidadCanvasSignal.set(el?.nativeElement ?? null);
  }

  private chartPreguntas?: Chart;
  private chartIntentos?: Chart;
  private chartTiempo?: Chart;
  private chartPracticante?: Chart;
  private chartRendimiento?: Chart;
  private chartEspecialidad?: Chart;

  constructor() {
    effect(() => {
      const canvas = this.preguntasCanvasSignal();
      const data = this.data();
      if (!canvas || !data) return;
      const labels = data.periodos.map((p) => p.label);
      const preguntas = data.periodos.map((p) => p.preguntas);
      if (this.chartPreguntas) {
        this.chartPreguntas.data.datasets[0].data = preguntas;
        this.chartPreguntas.update();
        return;
      }
      this.chartPreguntas = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Preguntas', data: preguntas, backgroundColor: PERIODO_COLORS, borderRadius: 4 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    });

    effect(() => {
      const canvas = this.intentosCanvasSignal();
      const data = this.data();
      if (!canvas || !data) return;
      const labels = data.periodos.map((p) => p.label);
      const intentos = data.periodos.map((p) => p.intentos);
      if (this.chartIntentos) {
        this.chartIntentos.data.datasets[0].data = intentos;
        this.chartIntentos.update();
        return;
      }
      this.chartIntentos = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Intentos', data: intentos, backgroundColor: '#22c55e', borderRadius: 4 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    });

    effect(() => {
      const canvas = this.tiempoCanvasSignal();
      const data = this.data();
      if (!canvas || !data) return;
      const labels = data.periodos.map((p) => p.label);
      const horas = data.periodos.map((p) => +(p.tiempo_segundos / 3600).toFixed(2));
      if (this.chartTiempo) {
        this.chartTiempo.data.datasets[0].data = horas;
        this.chartTiempo.update();
        return;
      }
      this.chartTiempo = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Horas de práctica', data: horas, backgroundColor: PERIODO_COLORS, borderRadius: 4 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${formatTiempo(data.periodos[ctx.dataIndex].tiempo_segundos)}`,
              },
            },
          },
          scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } } },
        },
      });
    });

    effect(() => {
      const canvas = this.practicanteCanvasSignal();
      const data = this.data();
      if (!canvas || !data) return;
      const items = data.top_practicantes;
      const labels = items.map((e) => nombreCompleto(e.nombres, e.apellidos));
      const valores = items.map((e) => e.total_preguntas ?? 0);
      if (this.chartPracticante) {
        this.chartPracticante.data.labels = labels;
        this.chartPracticante.data.datasets[0].data = valores;
        this.chartPracticante.update();
        return;
      }
      this.chartPracticante = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Preguntas practicadas', data: valores, backgroundColor: '#6366f1', borderRadius: 4 }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    });

    effect(() => {
      const canvas = this.rendimientoCanvasSignal();
      const data = this.data();
      if (!canvas || !data) return;
      const items = data.top_rendimiento;
      const labels = items.map((e) => nombreCompleto(e.nombres, e.apellidos));
      const valores = items.map((e) => +(e.porcentaje_promedio ?? 0).toFixed(1));
      if (this.chartRendimiento) {
        this.chartRendimiento.data.labels = labels;
        this.chartRendimiento.data.datasets[0].data = valores;
        this.chartRendimiento.update();
        return;
      }
      this.chartRendimiento = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: '% promedio', data: valores, backgroundColor: '#f59e0b', borderRadius: 4 }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x}%` } },
          },
          scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } } },
        },
      });
    });

    effect(() => {
      const canvas = this.especialidadCanvasSignal();
      const data = this.data();
      const periodoIdx = this.selectedPeriodo();
      if (!canvas || !data || !data.especialidades_periodos[periodoIdx]) return;
      const periodo = data.especialidades_periodos[periodoIdx];
      const labels = periodo.data.map((e) => e.especialidad);
      const correctas = periodo.data.map((e) => e.correctas);
      const incorrectas = periodo.data.map((e) => e.incorrectas);
      if (this.chartEspecialidad) {
        this.chartEspecialidad.data.labels = labels;
        this.chartEspecialidad.data.datasets[0].data = correctas;
        this.chartEspecialidad.data.datasets[1].data = incorrectas;
        this.chartEspecialidad.update();
        return;
      }
      this.chartEspecialidad = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Correctas', data: correctas, backgroundColor: '#22c55e', borderRadius: 4 },
            { label: 'Incorrectas', data: incorrectas, backgroundColor: '#ef4444', borderRadius: 4 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' }, tooltip: { mode: 'index' } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.chartPreguntas?.destroy();
    this.chartIntentos?.destroy();
    this.chartTiempo?.destroy();
    this.chartPracticante?.destroy();
    this.chartRendimiento?.destroy();
    this.chartEspecialidad?.destroy();
  }
}
