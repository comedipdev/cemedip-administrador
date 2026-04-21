import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmationService } from 'primeng/api';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ToastService } from '@core/services/toast.service';
import { ExamenesFiltros } from '@core/models/evaluaciones.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-examenes',
  imports: [DatePipe, RouterLink, FormsModule, ReactiveFormsModule, ButtonModule, ConfirmDialogModule, DatePickerModule, InputTextModule, PaginatorModule, ToggleSwitchModule],
  providers: [ConfirmationService],
  templateUrl: './examenes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenesComponent {
  private fb = inject(NonNullableFormBuilder);
  private evaluacionesService = inject(EvaluacionesService);
  private confirmationService = inject(ConfirmationService);
  private toast = inject(ToastService);

  protected readonly filtrosForm = this.fb.group({
    nombre: [''],
    fecha_inicio: [null as Date | null],
    fecha_fin: [null as Date | null],
  });

  private readonly filtros = signal<ExamenesFiltros>({ page: 1, page_size: 10 });

  protected readonly examenesResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.evaluacionesService.getExamenes(params),
  });

  protected readonly examenes = computed(() => this.examenesResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.examenesResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.examenesResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(() => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize());

  private readonly _ = effect(() => {
    const error = this.examenesResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  private toIsoDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  buscar() {
    const { nombre, fecha_inicio, fecha_fin } = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: this.pageSize(),
      nombre: nombre || undefined,
      fecha_inicio: this.toIsoDate(fecha_inicio),
      fecha_fin: this.toIsoDate(fecha_fin),
    });
  }

  limpiar() {
    this.filtrosForm.reset();
    this.filtros.set({ page: 1, page_size: this.pageSize() });
  }

  onPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 10;
    const sizeChanged = page_size !== this.pageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.pageSize.set(page_size);
    this.filtros.update((f) => ({ ...f, page, page_size }));
  }

  toggleActivo(id: number) {
    this.evaluacionesService.toggleActivoExamen(id).subscribe({
      next: () => this.examenesResource.reload(),
      error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
    });
  }

  confirmarEliminar(id: number) {
    this.confirmationService.confirm({
      message: `¿Desea eliminar el examen <strong>#${id}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.evaluacionesService.eliminarExamen(id).subscribe({
          next: () => {
            this.toast.success(`Examen #${id} eliminado.`);
            this.examenesResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }

  estadoLabel(estado: string): string {
    if (estado === 'proximo') return 'Próximo';
    if (estado === 'en_prgoreso') return 'En Progreso';
    return 'Finalizado';
  }

  estadoClass(estado: string): string {
    if (estado === 'proximo') return 'bg-blue-500';
    if (estado === 'en_prgoreso') return 'bg-teal-500';
    return 'bg-surface-400';
  }
}
