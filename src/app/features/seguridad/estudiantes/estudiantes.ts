import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SeguridadService } from '@core/services/seguridad.service';
import { EstudiantesFiltros } from '@core/models/seguridad.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-estudiantes',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstudiantesComponent {
  private fb = inject(NonNullableFormBuilder);
  private seguridadService = inject(SeguridadService);

  protected readonly filtrosForm = this.fb.group({
    nombres: [''],
    apellidos: [''],
    correo_institucional: [''],
  });

  private readonly filtros = signal<EstudiantesFiltros>({ page: 1, page_size: 10 });

  protected readonly estudiantesResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.seguridadService.getEstudiantes(params),
  });

  protected readonly estudiantes = computed(() => this.estudiantesResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.estudiantesResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.estudiantesResource.isLoading());

  protected readonly errorMessage = computed(() => {
    const error = this.estudiantesResource.error() as HttpErrorResponse | null;
    return error ? extractApiErrorMessage(error) : null;
  });

  protected readonly paginaActual = computed(() => this.paginador()?.pagina_actual ?? 1);
  protected readonly totalPaginas = computed(() => this.paginador()?.total_paginas ?? 1);

  protected readonly paginasVisibles = computed(() => {
    const actual = this.paginaActual();
    const total = this.totalPaginas();
    const rango = 2;
    const inicio = Math.max(1, actual - rango);
    const fin = Math.min(total, actual + rango);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  });

  buscar() {
    const { nombres, apellidos, correo_institucional } = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: 10,
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
      correo_institucional: correo_institucional || undefined,
    });
  }

  limpiar() {
    this.filtrosForm.reset();
    this.filtros.set({ page: 1, page_size: 10 });
  }

  irAPagina(page: number) {
    if (page < 1 || page > this.totalPaginas()) return;
    this.filtros.update((f) => ({ ...f, page }));
  }
}
