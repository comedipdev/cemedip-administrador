import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import {
  Especialidad,
  TipoEspecialidad,
  TemaEspecialidad,
  CreateTrainingRequest,
  TrainingAttempt,
  TrainingQuestion,
  AnswerResponseData,
  TrainingQuestionDetail,
  TrainingAttemptResult,
} from '@core/models/training.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private readonly http = inject(HttpClient);

  getEspecialidades(): Observable<ApiSuccessResponse<Especialidad[]>> {
    return this.http.get<ApiSuccessResponse<Especialidad[]>>(
      `${API_BASE_URL}/cliente/preguntas/especialidades/`,
    );
  }

  getTipos(especialidadIds: string[]): Observable<ApiSuccessResponse<TipoEspecialidad[]>> {
    let params = new HttpParams();
    for (const id of especialidadIds) {
      params = params.append('especialidades', id);
    }

    return this.http.get<ApiSuccessResponse<TipoEspecialidad[]>>(
      `${API_BASE_URL}/cliente/preguntas/tipos/`,
      { params },
    );
  }

  getTemas(
    especialidadIds: string[],
    tipoIds: string[],
  ): Observable<ApiSuccessResponse<TemaEspecialidad[]>> {
    let params = new HttpParams();
    for (const id of especialidadIds) {
      params = params.append('especialidades', id);
    }
    for (const id of tipoIds) {
      params = params.append('tipos', id);
    }

    return this.http.get<ApiSuccessResponse<TemaEspecialidad[]>>(
      `${API_BASE_URL}/cliente/preguntas/temas/`,
      { params },
    );
  }

  createTraining(request: CreateTrainingRequest): Observable<ApiSuccessResponse<TrainingAttempt>> {
    return this.http.post<ApiSuccessResponse<TrainingAttempt>>(
      `${API_BASE_URL}/cliente/evaluaciones/training/`,
      request,
    );
  }

  getTrainingAttempt(idIntento: number): Observable<ApiSuccessResponse<TrainingAttempt>> {
    return this.http.get<ApiSuccessResponse<TrainingAttempt>>(
      `${API_BASE_URL}/cliente/evaluaciones/training/${idIntento}/`,
    );
  }

  getQuestion(idIntento: number, indicePregunta: number): Observable<TrainingQuestionDetail> {
    return this.http
      .get<
        ApiSuccessResponse<TrainingQuestion>
      >(`${API_BASE_URL}/cliente/evaluaciones/training/${idIntento}/pregunta/${indicePregunta}/`)
      .pipe(map((response) => response.data.pregunta));
  }

  answerQuestion(
    idIntento: number,
    indicePregunta: number,
    idAlternativa: number,
  ): Observable<ApiSuccessResponse<AnswerResponseData>> {
    return this.http.post<ApiSuccessResponse<AnswerResponseData>>(
      `${API_BASE_URL}/cliente/evaluaciones/training/${idIntento}/pregunta/${indicePregunta}/`,
      { id_alternativa_intento: idAlternativa },
    );
  }

  finishTraining(idIntento: number): Observable<ApiSuccessResponse<TrainingAttemptResult>> {
    return this.http.post<ApiSuccessResponse<TrainingAttemptResult>>(
      `${API_BASE_URL}/cliente/evaluaciones/training/terminar/`,
      { id_intento: idIntento },
    );
  }
}
