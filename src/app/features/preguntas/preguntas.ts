import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { extractApiErrorMessage } from '@core/models/api.model';
import { PreguntasFiltros } from '@core/models/preguntas.model';
import { ToastService } from '@core/services/toast.service';
import { PreguntasService } from './services/preguntas.service';

interface OptionItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-preguntas',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, ConfirmDialogModule, FileUploadModule, InputTextModule, MultiSelectModule, PaginatorModule],
  providers: [ConfirmationService],
  templateUrl: './preguntas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntasComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly preguntasService = inject(PreguntasService);
  private readonly toast = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly filtrosForm = this.fb.group({
    enunciado: [''],
    alternativa: [''],
    respuesta: [''],
    especialidad: [[] as number[]],
    tipo: [[] as number[]],
    tema: [[] as number[]],
    feedback: [''],
  });

  private readonly filtros = signal<PreguntasFiltros>({ page: 1, page_size: 10 });

  protected readonly preguntasResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.preguntasService.getPreguntas(params),
  });

  protected readonly especialidadesResource = rxResource({
    stream: () =>
      this.preguntasService.getEspecialidades().pipe(
        map((response) =>
          response.data.map((item) => ({ label: item.nombre, value: item.id_especialidad })),
        ),
        catchError(() => of([] as OptionItem[])),
      ),
  });

  protected readonly selectedEspecialidad = signal<number[]>([]);
  protected readonly tiposResource = rxResource({
    params: () => this.selectedEspecialidad(),
    stream: ({ params }) => {
      if (!params.length) {
        return of([] as OptionItem[]);
      }

      return this.preguntasService.getTipos(params).pipe(
        map((response) =>
          response.data.map((item) => ({ label: item.nombre, value: item.id_tipo })),
        ),
        catchError(() => of([] as OptionItem[])),
      );
    },
  });

  protected readonly selectedTipo = signal<number[]>([]);
  protected readonly temasResource = rxResource({
    params: () => ({
      especialidades: this.selectedEspecialidad(),
      tipos: this.selectedTipo(),
    }),
    stream: ({ params }) => {
      if (!params.especialidades.length || !params.tipos.length) {
        return of([] as OptionItem[]);
      }

      return this.preguntasService.getTemas(params.especialidades, params.tipos).pipe(
        map((response) =>
          response.data.map((item) => ({ label: item.nombre, value: item.id_tema })),
        ),
        catchError(() => of([] as OptionItem[])),
      );
    },
  });

  protected readonly preguntas = computed(() => this.preguntasResource.value()?.data ?? []);
  protected readonly paginador = computed(
    () => this.preguntasResource.value()?.data_paginador ?? null,
  );
  protected readonly isLoading = computed(() => this.preguntasResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(
    () => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize(),
  );
  protected readonly especialidadOpciones = computed<OptionItem[]>(
    () => this.especialidadesResource.value() ?? [],
  );
  protected readonly tipoOpciones = computed<OptionItem[]>(
    () => this.tiposResource.value() ?? [],
  );
  protected readonly temaOpciones = computed<OptionItem[]>(
    () => this.temasResource.value() ?? [],
  );

  private readonly _ = effect(() => {
    const error = this.preguntasResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  buscar() {
    const raw = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: this.pageSize(),
      enunciado: raw.enunciado || undefined,
      alternativa: raw.alternativa || undefined,
      respuesta: raw.respuesta || undefined,
      especialidad: raw.especialidad.length ? raw.especialidad : null,
      tipo: raw.tipo.length ? raw.tipo : null,
      tema: raw.tema.length ? raw.tema : null,
      feedback: raw.feedback || undefined,
    });
  }

  limpiar() {
    this.filtrosForm.reset({
      enunciado: '',
      alternativa: '',
      respuesta: '',
      especialidad: [],
      tipo: [],
      tema: [],
      feedback: '',
    });
    this.selectedEspecialidad.set([]);
    this.selectedTipo.set([]);
    this.pageSize.set(10);
    this.filtros.set({ page: 1, page_size: 10 });
  }

  onEspecialidadChange(value: number[]) {
    this.selectedEspecialidad.set(value);
    this.selectedTipo.set([]);
    this.filtrosForm.patchValue({ tipo: [], tema: [] });
  }

  onTipoChange(value: number[]) {
    this.selectedTipo.set(value);
    this.filtrosForm.patchValue({ tema: [] });
  }

  onPageChange(event: PaginatorState) {
    const pageSize = event.rows ?? 10;
    const sizeChanged = pageSize !== this.pageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;

    this.pageSize.set(pageSize);
    this.filtros.update((current) => ({ ...current, page, page_size: pageSize }));
  }

  confirmarEliminar(id: number, enunciado: string) {
    this.confirmationService.confirm({
      message: `¿Desea eliminar la pregunta <strong>#${id}</strong>?<br><small class="text-surface-500">${enunciado.slice(0, 80)}${enunciado.length > 80 ? '...' : ''}</small>`,
      header: 'Eliminar pregunta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.preguntasService.eliminarPregunta(id).subscribe({
          next: () => {
            this.toast.success('Pregunta eliminada correctamente.');
            this.preguntasResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }

  protected readonly archivoExcel = signal<File | null>(null);
  protected readonly isUploading = signal(false);
  protected readonly resultadoCarga = signal<{ creados: number; errores: string[] } | null>(null);

  onSelectExcel(event: { files: File[] }) {
    this.archivoExcel.set(event.files[0] ?? null);
    this.resultadoCarga.set(null);
  }

  procesarCargaMasiva() {
    const archivo = this.archivoExcel();
    if (!archivo || this.isUploading()) return;
    this.isUploading.set(true);
    this.preguntasService.cargaMasivaPreguntas(archivo).subscribe({
      next: (res) => {
        this.resultadoCarga.set(res.data);
        this.archivoExcel.set(null);
        this.isUploading.set(false);
        this.preguntasResource.reload();
        this.toast.success(`Carga completada: ${res.data.creados} preguntas creadas.`);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isUploading.set(false);
      },
    });
  }

  protected truncateText(value: string | null | undefined, maxLength = 120): string {
    if (!value) {
      return '-';
    }

    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength).trimEnd()}...`;
  }
}
