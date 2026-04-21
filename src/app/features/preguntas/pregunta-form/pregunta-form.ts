import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { extractApiErrorMessage } from '@core/models/api.model';
import { PreguntasService } from '../services/preguntas.service';
import { ToastService } from '@core/services/toast.service';

interface OptionItem {
  label: string;
  value: number;
}

const LETRAS = ['A', 'B', 'C', 'D'];

@Component({
  selector: 'app-pregunta-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './pregunta-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntaFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly preguntasService = inject(PreguntasService);
  private readonly toast = inject(ToastService);

  protected readonly letras = LETRAS;

  protected readonly idPregunta = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly formSubmitted = signal(false);

  protected readonly esNuevo = computed(() => this.idPregunta() === null);

  // Cascade signals
  protected readonly selectedEspecialidad = signal<number | null>(null);
  protected readonly selectedTipo = signal<number | null>(null);

  // Segmentacion resources
  protected readonly especialidadesResource = rxResource({
    stream: () =>
      this.preguntasService.getEspecialidades().pipe(
        map((r) => r.data.map((e) => ({ label: e.nombre, value: e.id_especialidad }))),
        catchError(() => of([] as OptionItem[])),
      ),
  });

  protected readonly tiposResource = rxResource({
    params: () => this.selectedEspecialidad(),
    stream: ({ params }) => {
      if (!params) return of([] as OptionItem[]);
      return this.preguntasService.getTipos([params]).pipe(
        map((r) => r.data.map((t) => ({ label: t.nombre, value: t.id_tipo }))),
        catchError(() => of([] as OptionItem[])),
      );
    },
  });

  protected readonly temasResource = rxResource({
    params: () => ({ esp: this.selectedEspecialidad(), tipo: this.selectedTipo() }),
    stream: ({ params }) => {
      if (!params.esp || !params.tipo) return of([] as OptionItem[]);
      return this.preguntasService.getTemas([params.esp], [params.tipo]).pipe(
        map((r) => r.data.map((t) => ({ label: t.nombre, value: t.id_tema }))),
        catchError(() => of([] as OptionItem[])),
      );
    },
  });

  protected readonly especialidadOpciones = computed<OptionItem[]>(
    () => this.especialidadesResource.value() ?? [],
  );
  protected readonly tipoOpciones = computed<OptionItem[]>(
    () => this.tiposResource.value() ?? [],
  );
  protected readonly temaOpciones = computed<OptionItem[]>(
    () => this.temasResource.value() ?? [],
  );

  // Dialogs para crear segmentaciones
  protected readonly showEspecialidadDialog = signal(false);
  protected readonly showTipoDialog = signal(false);
  protected readonly showTemaDialog = signal(false);
  protected readonly nuevaEspecialidadNombre = signal('');
  protected readonly nuevoTipoNombre = signal('');
  protected readonly nuevoTemaNombre = signal('');
  protected readonly isSavingSegmentacion = signal(false);

  // Respuesta correcta derivada
  protected readonly respuestaCorrecta = computed(() => {
    const idx = this.alternativasArray.controls.findIndex(
      (c) => c.get('es_correcta')?.value === true,
    );
    if (idx === -1) return null;
    const letra = LETRAS[idx] ?? '?';
    const contenido = this.alternativasArray.controls[idx].get('contenido')?.value ?? '';
    return { letra, contenido };
  });

  // Form
  protected readonly form = this.fb.group({
    enunciado: ['', [Validators.required]],
    anho: [''],
    especialidad_id: [null as number | null],
    tipo_id: [null as number | null],
    tema_id: [null as number | null],
    justificacion: [''],
    fuente: [''],
    es_activo: [true],
    alternativas: this.fb.array(
      LETRAS.slice(0, 4).map(() =>
        this.fb.group({ contenido: [''], es_correcta: [false] }),
      ),
    ),
  });

  get alternativasArray(): FormArray {
    return this.form.get('alternativas') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idPregunta.set(+id);
      this.cargarPregunta(+id);
    }
  }

  private cargarPregunta(id: number) {
    this.isLoading.set(true);
    this.preguntasService.getPregunta(id).subscribe({
      next: (res) => {
        const p = res.data;

        // Configurar cascade antes de patchValue
        this.selectedEspecialidad.set(p.especialidad_id);
        this.selectedTipo.set(p.tipo_id);

        // Reconstruir alternativas array (siempre 4)
        while (this.alternativasArray.length) this.alternativasArray.removeAt(0);
        for (let i = 0; i < 4; i++) {
          const alt = p.alternativas[i];
          this.alternativasArray.push(
            this.fb.group({
              contenido: [alt?.contenido ?? ''],
              es_correcta: [alt?.es_correcta ?? false],
            }),
          );
        }

        this.form.patchValue({
          enunciado: p.enunciado,
          anho: p.anho ?? '',
          especialidad_id: p.especialidad_id,
          tipo_id: p.tipo_id,
          tema_id: p.tema_id,
          justificacion: p.feedback ?? '',
          fuente: p.fuente ?? '',
          es_activo: p.estado,
        });

        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  protected marcarCorrecta(index: number) {
    this.alternativasArray.controls.forEach((ctrl, i) => {
      ctrl.get('es_correcta')!.setValue(i === index, { emitEvent: false });
    });
  }

  protected onEspecialidadChange(value: number | null) {
    this.selectedEspecialidad.set(value);
    this.selectedTipo.set(null);
    this.form.patchValue({ tipo_id: null, tema_id: null });
  }

  protected onTipoChange(value: number | null) {
    this.selectedTipo.set(value);
    this.form.patchValue({ tema_id: null });
  }

  guardar() {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSaving()) return;

    const alts = this.alternativasArray.controls;
    const correctas = alts.filter((c) => c.get('es_correcta')?.value);
    if (correctas.length !== 1) {
      this.toast.error('Debe marcar exactamente una alternativa como correcta.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      enunciado: raw.enunciado,
      anho: raw.anho || null,
      especialidad_id: raw.especialidad_id,
      tipo_id: raw.tipo_id,
      tema_id: raw.tema_id,
      justificacion: raw.justificacion || null,
      fuente: raw.fuente || null,
      es_activo: raw.es_activo,
      alternativas: raw.alternativas.map((alt, i) => ({
        identificador_letra: LETRAS[i] ?? String(i + 1),
        contenido: alt.contenido,
        es_correcta: alt.es_correcta,
      })),
    };

    this.isSaving.set(true);
    const id = this.idPregunta();
    const req = id
      ? this.preguntasService.actualizarPregunta(id, payload)
      : this.preguntasService.crearPregunta(payload);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (!id) {
          this.toast.success('Pregunta creada correctamente.');
          this.router.navigate(['/preguntas', res.data.id_pregunta]);
        } else {
          this.toast.success('Pregunta guardada correctamente.');
          this.idPregunta.set(res.data.id_pregunta);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }

  // --- Crear segmentaciones ---

  protected confirmarNuevaEspecialidad() {
    const nombre = this.nuevaEspecialidadNombre().trim();
    if (!nombre) return;
    this.isSavingSegmentacion.set(true);
    this.preguntasService.crearEspecialidad(nombre).subscribe({
      next: (res) => {
        const nueva = { label: res.data.nombre, value: res.data.id_especialidad };
        this.especialidadesResource.reload();
        this.form.patchValue({ especialidad_id: nueva.value });
        this.onEspecialidadChange(nueva.value);
        this.showEspecialidadDialog.set(false);
        this.nuevaEspecialidadNombre.set('');
        this.isSavingSegmentacion.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSavingSegmentacion.set(false);
      },
    });
  }

  protected confirmarNuevoTipo() {
    const nombre = this.nuevoTipoNombre().trim();
    if (!nombre) return;
    this.isSavingSegmentacion.set(true);
    this.preguntasService.crearTipo(nombre).subscribe({
      next: (res) => {
        this.tiposResource.reload();
        this.form.patchValue({ tipo_id: res.data.id_tipo });
        this.onTipoChange(res.data.id_tipo);
        this.showTipoDialog.set(false);
        this.nuevoTipoNombre.set('');
        this.isSavingSegmentacion.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSavingSegmentacion.set(false);
      },
    });
  }

  protected confirmarNuevoTema() {
    const nombre = this.nuevoTemaNombre().trim();
    if (!nombre) return;
    this.isSavingSegmentacion.set(true);
    this.preguntasService.crearTema(nombre).subscribe({
      next: (res) => {
        this.temasResource.reload();
        this.form.patchValue({ tema_id: res.data.id_tema });
        this.showTemaDialog.set(false);
        this.nuevoTemaNombre.set('');
        this.isSavingSegmentacion.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSavingSegmentacion.set(false);
      },
    });
  }
}
