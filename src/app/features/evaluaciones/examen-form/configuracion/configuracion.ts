import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ToastService } from '@core/services/toast.service';
import { PreguntasService } from '@features/preguntas/services/preguntas.service';
import { extractApiErrorMessage } from '@core/models/api.model';
import { ExamenFormInput } from '@core/models/evaluaciones.model';

interface OptionItem { label: string; value: number; }

const ESTADO_EXAMEN_LABELS: Record<string, string> = {
  proximo: 'Próximo',
  en_prgoreso: 'En Progreso',
  finalizado: 'Finalizado',
};

@Component({
  selector: 'app-examen-configuracion',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    InputNumberModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './configuracion.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenConfiguracionComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly preguntasService = inject(PreguntasService);
  private readonly toast = inject(ToastService);

  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly estadoExamen = signal<string | null>(null);

  protected readonly idExamen = signal<number | null>(null);
  protected readonly esNuevo = computed(() => this.idExamen() === null);

  protected readonly estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  protected readonly intentosOptions = Array.from({ length: 10 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
  }));

  protected readonly selectedEspecialidades = signal<number[]>([]);
  protected readonly selectedTipos = signal<number[]>([]);

  protected readonly especialidadesResource = rxResource({
    stream: () =>
      this.preguntasService.getEspecialidades().pipe(
        map((r) => r.data.map((e): OptionItem => ({ label: e.nombre, value: e.id_especialidad }))),
        catchError(() => of([] as OptionItem[])),
      ),
  });

  protected readonly tiposResource = rxResource({
    params: () => this.selectedEspecialidades(),
    stream: ({ params }) => {
      if (!params.length) return of([] as OptionItem[]);
      return this.preguntasService.getTipos(params).pipe(
        map((r) => r.data.map((t): OptionItem => ({ label: t.nombre, value: t.id_tipo }))),
        catchError(() => of([] as OptionItem[])),
      );
    },
  });

  protected readonly temasResource = rxResource({
    params: () => ({ especialidades: this.selectedEspecialidades(), tipos: this.selectedTipos() }),
    stream: ({ params }) => {
      if (!params.especialidades.length || !params.tipos.length) return of([] as OptionItem[]);
      return this.preguntasService.getTemas(params.especialidades, params.tipos).pipe(
        map((r) => r.data.map((t): OptionItem => ({ label: t.nombre, value: t.id_tema }))),
        catchError(() => of([] as OptionItem[])),
      );
    },
  });

  protected readonly especialidadOpciones = computed(() => this.especialidadesResource.value() ?? []);
  protected readonly tipoOpciones = computed(() => this.tiposResource.value() ?? []);
  protected readonly temaOpciones = computed(() => this.temasResource.value() ?? []);
  protected readonly estadoExamenLabel = computed(() =>
    this.estadoExamen() ? (ESTADO_EXAMEN_LABELS[this.estadoExamen()!] ?? this.estadoExamen()) : null,
  );

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['' as string],
    fecha_inicio: [null as Date | null, [Validators.required]],
    fecha_entrega: [null as Date | null, [Validators.required]],
    numero_intentos: [1, [Validators.required, Validators.min(1)]],
    duracion_minutos: [null as number | null, [Validators.required, Validators.min(1)]],
    numero_preguntas: [null as number | null, [Validators.required, Validators.min(1)]],
    puntaje_maximo: [null as number | null, [Validators.required, Validators.min(0)]],
    es_activo: [true],
    especialidades_ids: [[] as number[]],
    tipos_ids: [[] as number[]],
    temas_ids: [[] as number[]],
  });

  ngOnInit() {
    const idStr = this.route.parent?.snapshot.paramMap.get('id');
    if (idStr) {
      this.idExamen.set(Number(idStr));
      this.cargarExamen(Number(idStr));
    }
  }

  private cargarExamen(id: number) {
    this.isLoading.set(true);
    this.evaluacionesService.getExamenDetalle(id).subscribe({
      next: (res) => {
        const e = res.data;
        this.estadoExamen.set(e.estado_examen);
        const cfg = e.configuracion;
        this.form.patchValue({
          nombre: e.nombre,
          descripcion: e.descripcion ?? '',
          fecha_inicio: e.fecha_inicio ? new Date(e.fecha_inicio) : null,
          fecha_entrega: e.fecha_entrega ? new Date(e.fecha_entrega) : null,
          numero_intentos: e.numero_intentos,
          duracion_minutos: e.duracion_minutos,
          numero_preguntas: e.numero_preguntas,
          puntaje_maximo: Number(e.puntaje_maximo),
          es_activo: e.es_activo,
          especialidades_ids: cfg?.especialidades_ids ?? [],
          tipos_ids: cfg?.tipos_ids ?? [],
          temas_ids: cfg?.temas_ids ?? [],
        });
        this.selectedEspecialidades.set(cfg?.especialidades_ids ?? []);
        this.selectedTipos.set(cfg?.tipos_ids ?? []);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  onEspecialidadChange(value: number[]) {
    this.selectedEspecialidades.set(value);
    this.selectedTipos.set([]);
    this.form.patchValue({ tipos_ids: [], temas_ids: [] });
  }

  onTipoChange(value: number[]) {
    this.selectedTipos.set(value);
    this.form.patchValue({ temas_ids: [] });
  }

  private toIsoDateTime(date: Date | null): string {
    return date ? date.toISOString() : '';
  }

  guardar() {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving()) return;

    const raw = this.form.getRawValue();
    const payload: ExamenFormInput = {
      nombre: raw.nombre,
      descripcion: raw.descripcion || null,
      fecha_inicio: this.toIsoDateTime(raw.fecha_inicio),
      fecha_entrega: this.toIsoDateTime(raw.fecha_entrega),
      numero_intentos: raw.numero_intentos,
      duracion_minutos: raw.duracion_minutos!,
      numero_preguntas: raw.numero_preguntas!,
      puntaje_maximo: raw.puntaje_maximo!,
      es_activo: raw.es_activo,
      configuracion: {
        especialidades_ids: raw.especialidades_ids,
        tipos_ids: raw.tipos_ids,
        temas_ids: raw.temas_ids,
      },
    };

    this.isSaving.set(true);
    const id = this.idExamen();
    const req = id
      ? this.evaluacionesService.actualizarExamen(id, payload)
      : this.evaluacionesService.crearExamen(payload);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (!id) {
          this.toast.success('Examen creado correctamente.');
          this.router.navigate(['/evaluaciones/examenes', res.data.id_examen, 'configuracion']);
        } else {
          this.toast.success('Examen guardado correctamente.');
          this.estadoExamen.set(res.data.estado_examen);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }
}
