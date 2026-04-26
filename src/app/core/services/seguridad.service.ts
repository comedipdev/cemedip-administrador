import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import { Administrador, AdministradorCreateInput, AdministradorDetalle, AdministradoresFiltros, AdministradorUpdateInput, Estudiante, EstudianteCreateInput, EstudianteDetalle, EstudiantesFiltros, EstudianteUpdateInput } from '@core/models/seguridad.model';

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
    if (filtros.is_activo !== undefined) params = params.set('is_activo', filtros.is_activo.toString());

    return this.http.get<ApiSuccessResponse<Estudiante[]>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/`,
      { params },
    );
  }

  getEstudiante(id: number): Observable<ApiSuccessResponse<EstudianteDetalle>> {
    return this.http.get<ApiSuccessResponse<EstudianteDetalle>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/${id}/`,
    );
  }

  crearEstudiante(data: EstudianteCreateInput): Observable<ApiSuccessResponse<EstudianteDetalle>> {
    return this.http.post<ApiSuccessResponse<EstudianteDetalle>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/`,
      data,
    );
  }

  actualizarEstudiante(id: number, data: EstudianteUpdateInput): Observable<ApiSuccessResponse<EstudianteDetalle>> {
    return this.http.put<ApiSuccessResponse<EstudianteDetalle>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/${id}/`,
      data,
    );
  }

  activarEstudiante(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.post<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/${id}/activar/`,
      {},
    );
  }

  inactivarEstudiante(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.post<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/${id}/inactivar/`,
      {},
    );
  }

  cargaMasivaEstudiantes(archivo: File): Observable<ApiSuccessResponse<{ creados: number; actualizados: number; errores: string[] }>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ApiSuccessResponse<{ creados: number; actualizados: number; errores: string[] }>>(
      `${API_BASE_URL}/admin/seguridad/carga-masiva-estudiantes/`,
      formData,
    );
  }

  getAdministradores(filtros: AdministradoresFiltros): Observable<ApiSuccessResponse<Administrador[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.is_activo !== undefined) params = params.set('is_activo', filtros.is_activo.toString());

    return this.http.get<ApiSuccessResponse<Administrador[]>>(
      `${API_BASE_URL}/admin/seguridad/administradores/`,
      { params },
    );
  }

  getAdministrador(id: number): Observable<ApiSuccessResponse<AdministradorDetalle>> {
    return this.http.get<ApiSuccessResponse<AdministradorDetalle>>(
      `${API_BASE_URL}/admin/seguridad/administradores/${id}/`,
    );
  }

  crearAdministrador(data: AdministradorCreateInput): Observable<ApiSuccessResponse<AdministradorDetalle>> {
    return this.http.post<ApiSuccessResponse<AdministradorDetalle>>(
      `${API_BASE_URL}/admin/seguridad/administradores/`,
      data,
    );
  }

  actualizarAdministrador(id: number, data: AdministradorUpdateInput): Observable<ApiSuccessResponse<AdministradorDetalle>> {
    return this.http.put<ApiSuccessResponse<AdministradorDetalle>>(
      `${API_BASE_URL}/admin/seguridad/administradores/${id}/`,
      data,
    );
  }

  activarAdministrador(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.post<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/seguridad/administradores/${id}/activar/`,
      {},
    );
  }

  inactivarAdministrador(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.post<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/seguridad/administradores/${id}/inactivar/`,
      {},
    );
  }
}
