import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ConfirmationService } from 'primeng/api';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ToastService } from '@core/services/toast.service';
import { IntentosFiltros } from '@core/models/evaluaciones.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-intentos',
  imports: [DatePipe, ReactiveFormsModule, ButtonModule, ConfirmDialogModule, DatePickerModule, InputTextModule, PaginatorModule],
  providers: [ConfirmationService],
  templateUrl: './intentos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentosComponent {
  private fb = inject(NonNullableFormBuilder);
  private evaluacionesService = inject(EvaluacionesService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected readonly filtrosForm = this.fb.group({
    nombres: [''],
    apellidos: [''],
    identificacion: [''],
    fecha_inicio: [null as Date | null],
    fecha_fin: [null as Date | null],
  });

  private readonly filtros = signal<IntentosFiltros>({ page: 1, page_size: 10 });

  protected readonly intentosResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.evaluacionesService.getIntentos(params),
  });

  protected readonly intentos = computed(() => this.intentosResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.intentosResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.intentosResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(() => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize());

  private readonly _ = effect(() => {
    const error = this.intentosResource.error() as HttpErrorResponse | null;
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
    const { nombres, apellidos, identificacion, fecha_inicio, fecha_fin } = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: this.pageSize(),
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
      identificacion: identificacion || undefined,
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

  verDetalle(id: number) {
    this.router.navigate(['/evaluaciones/intentos', id]);
  }

  confirmarEliminar(id: number) {
    this.confirmationService.confirm({
      message: `¿Desea eliminar el intento <strong>#${id}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.evaluacionesService.eliminarIntento(id).subscribe({
          next: () => {
            this.toast.success(`Intento #${id} eliminado.`);
            this.intentosResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }
}
