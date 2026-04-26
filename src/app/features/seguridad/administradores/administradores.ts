import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { SeguridadService } from '@core/services/seguridad.service';
import { ToastService } from '@core/services/toast.service';
import { AdministradoresFiltros } from '@core/models/seguridad.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-administradores',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, ConfirmDialogModule, InputTextModule, PaginatorModule, SelectModule],
  providers: [ConfirmationService],
  templateUrl: './administradores.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministradoresComponent {
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
    nombre: [''],
    is_activo: [true as boolean | null],
  });

  private readonly filtros = signal<AdministradoresFiltros>({ page: 1, page_size: 10, is_activo: true });

  protected readonly administradoresResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.seguridadService.getAdministradores(params),
  });

  protected readonly administradores = computed(() => this.administradoresResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.administradoresResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.administradoresResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(() => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize());

  private readonly _ = effect(() => {
    const error = this.administradoresResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  buscar() {
    const { nombre, is_activo } = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: 10,
      nombre: nombre || undefined,
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

  verAdministrador(id: number) {
    this.router.navigate(['/seguridad/administradores', id]);
  }

  confirmarInactivar(id: number, nombre: string) {
    this.confirmationService.confirm({
      message: `¿Desea inactivar a <strong>${nombre}</strong>? Esta acción deshabilitará su acceso al sistema.`,
      header: 'Confirmar inactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, inactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.seguridadService.inactivarAdministrador(id).subscribe({
          next: () => {
            this.toast.success(`${nombre} ha sido inactivado.`);
            this.administradoresResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }
}
