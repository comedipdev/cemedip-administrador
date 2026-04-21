import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { SeguridadService } from '@core/services/seguridad.service';
import { ToastService } from '@core/services/toast.service';
import { EstudiantesFiltros } from '@core/models/seguridad.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-estudiantes',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, ConfirmDialogModule, FileUploadModule, InputTextModule, PaginatorModule, SelectModule],
  providers: [ConfirmationService],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstudiantesComponent {
  private fb = inject(NonNullableFormBuilder);
  private seguridadService = inject(SeguridadService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected readonly estadoOpciones = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false },
  ];

  protected readonly filtrosForm = this.fb.group({
    nombres: [''],
    apellidos: [''],
    correo_institucional: [''],
    is_activo: [true as boolean | null],
  });

  private readonly filtros = signal<EstudiantesFiltros>({ page: 1, page_size: 10, is_activo: true });

  protected readonly estudiantesResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.seguridadService.getEstudiantes(params),
  });

  protected readonly estudiantes = computed(() => this.estudiantesResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.estudiantesResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.estudiantesResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(() => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize());

  private readonly _ = effect(() => {
    const error = this.estudiantesResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  buscar() {
    const { nombres, apellidos, correo_institucional, is_activo } = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: 10,
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
      correo_institucional: correo_institucional || undefined,
      is_activo: is_activo !== null ? is_activo : undefined,
    });
  }

  limpiar() {
    this.filtrosForm.reset();
    this.filtros.set({ page: 1, page_size: 10, is_activo: true });
  }

  onPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 10;
    const sizeChanged = page_size !== this.pageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.pageSize.set(page_size);
    this.filtros.update((f) => ({ ...f, page, page_size }));
  }

  verEstudiante(id: number) {
    this.router.navigate(['/seguridad/estudiantes', id]);
  }

  protected readonly archivoExcel = signal<File | null>(null);
  protected readonly isUploading = signal(false);
  protected readonly resultadoCarga = signal<{ creados: number; actualizados: number; errores: string[] } | null>(null);

  onSelectExcel(event: { files: File[] }) {
    this.archivoExcel.set(event.files[0] ?? null);
    this.resultadoCarga.set(null);
  }

  procesarCargaMasiva() {
    const archivo = this.archivoExcel();
    if (!archivo || this.isUploading()) return;
    this.isUploading.set(true);
    this.seguridadService.cargaMasivaEstudiantes(archivo).subscribe({
      next: (res) => {
        this.resultadoCarga.set(res.data);
        this.archivoExcel.set(null);
        this.isUploading.set(false);
        this.estudiantesResource.reload();
        this.toast.success(`Carga completada: ${res.data.creados} creados, ${res.data.actualizados} actualizados.`);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isUploading.set(false);
      },
    });
  }

  confirmarEliminar(id: number, nombre: string) {
    this.confirmationService.confirm({
      message: `¿Desea inactivar a <strong>${nombre}</strong>? Esta acción deshabilitará su acceso al sistema.`,
      header: 'Confirmar inactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, inactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.seguridadService.inactivarEstudiante(id).subscribe({
          next: () => {
            this.toast.success(`${nombre} ha sido inactivado.`);
            this.estudiantesResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }
}
