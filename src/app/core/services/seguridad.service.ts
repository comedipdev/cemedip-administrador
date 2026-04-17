import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import { Estudiante, EstudiantesFiltros } from '@core/models/seguridad.model';

@Injectable({ providedIn: 'root' })
export class SeguridadService {
  private http = inject(HttpClient);

  getEstudiantes(filtros: EstudiantesFiltros): Observable<ApiSuccessResponse<Estudiante[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.nombres) params = params.set('nombres', filtros.nombres);
    if (filtros.apellidos) params = params.set('apellidos', filtros.apellidos);
    if (filtros.correo_institucional) params = params.set('correo_institucional', filtros.correo_institucional);
    if (filtros.id_estudiante) params = params.set('id_estudiante', filtros.id_estudiante);

    return this.http.get<ApiSuccessResponse<Estudiante[]>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/`,
      { params },
    );
  }
}
