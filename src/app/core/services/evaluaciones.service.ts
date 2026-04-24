import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import { Examen, ExamenDetalle, ExamenFormInput, ExamenesFiltros, ExamenResultadosData, Intento, IntentoDetalleAdmin, IntentosFiltros } from '@core/models/evaluaciones.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionesService {
  private http = inject(HttpClient);

  getIntentos(filtros: IntentosFiltros): Observable<ApiSuccessResponse<Intento[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.nombres) params = params.set('nombres', filtros.nombres);
    if (filtros.apellidos) params = params.set('apellidos', filtros.apellidos);
    if (filtros.identificacion) params = params.set('identificacion', filtros.identificacion);
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);

    return this.http.get<ApiSuccessResponse<Intento[]>>(
      `${API_BASE_URL}/admin/evaluaciones/intentos/`,
      { params },
    );
  }

  getIntentoDetalle(id: number): Observable<ApiSuccessResponse<IntentoDetalleAdmin>> {
    return this.http.get<ApiSuccessResponse<IntentoDetalleAdmin>>(
      `${API_BASE_URL}/admin/evaluaciones/intentos/${id}/`,
    );
  }

  eliminarIntento(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.delete<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/evaluaciones/intentos/${id}/`,
    );
  }

  getExamenes(filtros: ExamenesFiltros): Observable<ApiSuccessResponse<Examen[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);

    return this.http.get<ApiSuccessResponse<Examen[]>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/`,
      { params },
    );
  }

  eliminarExamen(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.delete<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${id}/`,
    );
  }

  toggleActivoExamen(id: number): Observable<ApiSuccessResponse<{ es_activo: boolean }>> {
    return this.http.patch<ApiSuccessResponse<{ es_activo: boolean }>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${id}/`,
      {},
    );
  }

  getExamenDetalle(id: number): Observable<ApiSuccessResponse<ExamenDetalle>> {
    return this.http.get<ApiSuccessResponse<ExamenDetalle>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${id}/`,
    );
  }

  crearExamen(data: ExamenFormInput): Observable<ApiSuccessResponse<ExamenDetalle>> {
    return this.http.post<ApiSuccessResponse<ExamenDetalle>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/`,
      data,
    );
  }

  actualizarExamen(id: number, data: ExamenFormInput): Observable<ApiSuccessResponse<ExamenDetalle>> {
    return this.http.put<ApiSuccessResponse<ExamenDetalle>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${id}/`,
      data,
    );
  }

  agregarPreguntasEspecialidad(
    idExamen: number,
    data: { especialidad_id: number; cantidad: number },
  ): Observable<ApiSuccessResponse<ExamenDetalle>> {
    return this.http.post<ApiSuccessResponse<ExamenDetalle>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${idExamen}/preguntas/`,
      data,
    );
  }

  quitarPreguntaExamen(
    idExamen: number,
    idExamenPregunta: number,
  ): Observable<ApiSuccessResponse<ExamenDetalle>> {
    return this.http.delete<ApiSuccessResponse<ExamenDetalle>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${idExamen}/preguntas/${idExamenPregunta}/`,
    );
  }

  getResultadosExamen(idExamen: number): Observable<ApiSuccessResponse<ExamenResultadosData>> {
    return this.http.get<ApiSuccessResponse<ExamenResultadosData>>(
      `${API_BASE_URL}/admin/evaluaciones/examenes/${idExamen}/resultados/`,
    );
  }
}
