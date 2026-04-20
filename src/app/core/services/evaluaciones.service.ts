import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import { Intento, IntentoDetalleAdmin, IntentosFiltros } from '@core/models/evaluaciones.model';

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

  eliminarIntento(id: number): Observable<ApiSuccessResponse<{}>> {
    return this.http.delete<ApiSuccessResponse<{}>>(
      `${API_BASE_URL}/admin/evaluaciones/intentos/${id}/`,
    );
  }
}
