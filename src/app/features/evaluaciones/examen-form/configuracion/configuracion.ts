import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormsModule, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ToastService } from '@core/services/toast.service';
import { PreguntasService } from '@features/preguntas/services/preguntas.service';
import { ApiSuccessResponse, extractApiErrorMessage } from '@core/models/api.model';
import { ExamenFormInput, ExamenPreguntaItem } from '@core/models/evaluaciones.model';
import { PreguntaListadoItem, PreguntasFiltros } from '@core/models/preguntas.model';

interface OptionItem { label: string; value: number; }

function fechasValidator(group: AbstractControl): ValidationErrors | null {
  const inicio = group.get('fecha_inicio')?.value as Date | null;
  const entrega = group.get('fecha_entrega')?.value as Date | null;
  if (inicio && entrega && entrega <= inicio) {
    return { fechaEntregaInvalida: true };
  }
  return null;
}

const ESTADO_EXAMEN_LABELS: Record<string, string> = {
  proximo: 'Próximo',
  en_progreso: 'En Progreso',
  finalizado: 'Finalizado',
};

@Component({
  selector: 'app-examen-configuracion',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    InputNumberModule,
    PaginatorModule,
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
  protected readonly isAdding = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly estadoExamen = signal<string | null>(null);
  protected readonly preguntas = signal<ExamenPreguntaItem[]>([]);
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

  protected readonly especialidadesResource = rxResource({
    stream: () =>
      this.preguntasService.getEspecialidades().pipe(
        map((r) => r.data.map((e): OptionItem => ({ label: e.nombre, value: e.id_especialidad }))),
        catchError(() => of([] as OptionItem[])),
      ),
  });

  protected readonly especialidadOpciones = computed(() => this.especialidadesResource.value() ?? []);
  protected readonly estadoExamenLabel = computed(() =>
    this.estadoExamen() ? (ESTADO_EXAMEN_LABELS[this.estadoExamen()!] ?? this.estadoExamen()) : null,
  );

  protected readonly especialidadesResumen = computed(() => {
    const counts = new Map<string, number>();
    for (const p of this.preguntas()) {
      if (p.especialidad) {
        counts.set(p.especialidad, (counts.get(p.especialidad) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  });

  protected readonly totalPreguntas = computed(() => this.preguntas().length);
  protected readonly puedeEditar = computed(() => this.estadoExamen() === 'proximo');

  // ── Banco de preguntas ──
  protected readonly bancoFilterCodigo = signal('');
  protected readonly bancoFilterEnunciado = signal('');
  protected readonly bancoFilterEspecialidad = signal<number | null>(null);
  private readonly bancoBusqueda = signal<PreguntasFiltros & { _idExamen: number | null }>({
    page: 1, page_size: 5, _idExamen: null,
  });
  protected readonly isAddingPreguntaId = signal<number | null>(null);

  private readonly emptyBancoResponse: ApiSuccessResponse<PreguntaListadoItem[]> = {
    statusCode: 200, status: 'success', data: [], total_data: 0,
  };

  protected readonly preguntasBancoResource = rxResource({
    params: () => this.bancoBusqueda(),
    stream: ({ params }) => {
      if (!params._idExamen) return of(this.emptyBancoResponse);
      const filtros: PreguntasFiltros = { page: params.page, page_size: 5 };
      if (params.codigo) filtros.codigo = params.codigo;
      if (params.enunciado) filtros.enunciado = params.enunciado;
      if (params.especialidad?.length) filtros.especialidad = params.especialidad;
      return this.preguntasService.getPreguntas(filtros).pipe(
        catchError(() => of(this.emptyBancoResponse)),
      );
    },
  });

  protected readonly preguntasBanco = computed(() => this.preguntasBancoResource.value()?.data ?? []);
  protected readonly preguntasBancoTotal = computed(() => this.preguntasBancoResource.value()?.total_data ?? 0);
  protected readonly preguntasBancoPrimerItem = computed(() => {
    const p = this.bancoBusqueda().page ?? 1;
    return (p - 1) * 10;
  });
  protected readonly preguntasEnExamenIds = computed(
    () => new Set(this.preguntas().map(p => p.pregunta_id).filter((id): id is number => id !== null)),
  );

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['' as string],
    fecha_inicio: [null as Date | null, [Validators.required]],
    fecha_entrega: [null as Date | null, [Validators.required]],
    numero_intentos: [1, [Validators.required, Validators.min(1)]],
    duracion_minutos: [null as number | null, [Validators.required, Validators.min(1)]],
    puntaje_maximo: [null as number | null, [Validators.required, Validators.min(0)]],
    es_activo: [true],
  }, { validators: fechasValidator });

  protected readonly agregarForm: FormGroup = this.fb.group({
    especialidad_id: [null as number | null, [Validators.required]],
    cantidad: [null as number | null, [Validators.required, Validators.min(1)]],
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
        this.form.patchValue({
          nombre: e.nombre,
          descripcion: e.descripcion ?? '',
          fecha_inicio: e.fecha_inicio ? new Date(e.fecha_inicio) : null,
          fecha_entrega: e.fecha_entrega ? new Date(e.fecha_entrega) : null,
          numero_intentos: e.numero_intentos,
          duracion_minutos: e.duracion_minutos,
          puntaje_maximo: Number(e.puntaje_maximo),
          es_activo: e.es_activo,
        });
        this.preguntas.set(e.preguntas ?? []);
        this.bancoBusqueda.set({ page: 1, page_size: 5, _idExamen: id });
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoading.set(false);
      },
    });
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
      puntaje_maximo: raw.puntaje_maximo!,
      es_activo: raw.es_activo,
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
          this.toast.success('Examen creado. Ahora puede agregar preguntas.');
          this.router.navigate(['/evaluaciones/examenes', res.data.id_examen, 'configuracion']);
        } else {
          this.toast.success('Examen guardado correctamente.');
          this.estadoExamen.set(res.data.estado_examen);
          this.preguntas.set(res.data.preguntas ?? []);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }

  agregarDesdeEspecialidad() {
    if (this.agregarForm.invalid || this.isAdding()) return;
    const raw = this.agregarForm.getRawValue() as { especialidad_id: number; cantidad: number };
    const id = this.idExamen()!;

    this.isAdding.set(true);
    this.evaluacionesService
      .agregarPreguntasEspecialidad(id, {
        especialidad_id: raw.especialidad_id,
        cantidad: raw.cantidad,
      })
      .subscribe({
        next: (res) => {
          this.isAdding.set(false);
          this.preguntas.set(res.data.preguntas ?? []);
          this.agregarForm.reset();
          this.toast.success(`${raw.cantidad} preguntas agregadas correctamente.`);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(extractApiErrorMessage(err));
          this.isAdding.set(false);
        },
      });
  }

  quitarPregunta(idExamenPregunta: number) {
    const id = this.idExamen()!;
    this.evaluacionesService.quitarPreguntaExamen(id, idExamenPregunta).subscribe({
      next: (res) => {
        this.preguntas.set(res.data.preguntas ?? []);
        this.toast.success('Pregunta quitada del examen.');
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
      },
    });
  }

  buscarEnBanco() {
    this.bancoBusqueda.set({
      page: 1,
      page_size: 5,
      _idExamen: this.idExamen(),
      ...(this.bancoFilterCodigo().trim() ? { codigo: this.bancoFilterCodigo().trim() } : {}),
      ...(this.bancoFilterEnunciado().trim() ? { enunciado: this.bancoFilterEnunciado().trim() } : {}),
      ...(this.bancoFilterEspecialidad() !== null ? { especialidad: [this.bancoFilterEspecialidad()!] } : {}),
    });
  }

  onBancoPaginate(event: PaginatorState) {
    this.bancoBusqueda.update(b => ({ ...b, page: (event.page ?? 0) + 1 }));
  }

  agregarPreguntaIndividual(idPregunta: number) {
    if (this.isAddingPreguntaId() !== null) return;
    const id = this.idExamen()!;
    this.isAddingPreguntaId.set(idPregunta);
    this.evaluacionesService.agregarPreguntaIndividual(id, idPregunta).subscribe({
      next: (res) => {
        this.isAddingPreguntaId.set(null);
        this.preguntas.set(res.data.preguntas ?? []);
        this.toast.success('Pregunta agregada al examen.');
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isAddingPreguntaId.set(null);
      },
    });
  }
}
