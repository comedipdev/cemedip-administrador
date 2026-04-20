import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import { PreguntaListadoItem } from '@core/models/preguntas.model';
import { PreguntasService } from './preguntas.service';

describe('PreguntasService', () => {
  let service: PreguntasService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PreguntasService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should request preguntas with serialized filters', () => {
    const response: ApiSuccessResponse<PreguntaListadoItem[]> = {
      status: 'success',
      statusCode: 200,
      data: [],
      total_data: 0,
      data_paginador: {
        pagina_actual: 1,
        total_paginas: 0,
        total_registros: 0,
        por_pagina: 10,
      },
    };

    service
      .getPreguntas({
        page: 2,
        page_size: 25,
        enunciado: ' aborto ',
        alternativa: 'diferido',
        respuesta: 'Aborto diferido',
        especialidad: [3],
        tipo: [7],
        tema: [11],
        feedback: ' uterino ',
      })
      .subscribe((result) => {
        expect(result).toEqual(response);
      });

    const req = httpTestingController.expectOne((request) => {
      return request.method === 'GET' && request.url === `${API_BASE_URL}/admin/preguntas/`;
    });

    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('page_size')).toBe('25');
    expect(req.request.params.get('enunciado')).toBe('aborto');
    expect(req.request.params.get('alternativa')).toBe('diferido');
    expect(req.request.params.get('respuesta')).toBe('Aborto diferido');
    expect(req.request.params.get('especialidad')).toBe('3');
    expect(req.request.params.get('tipo')).toBe('7');
    expect(req.request.params.get('tema')).toBe('11');
    expect(req.request.params.get('feedback')).toBe('uterino');
    req.flush(response);
  });

  it('should request tipos for one especialidad', () => {
    service.getTipos([5]).subscribe();

    const req = httpTestingController.expectOne((request) => {
      return request.method === 'GET' && request.url === `${API_BASE_URL}/cliente/preguntas/tipos/`;
    });

    expect(req.request.params.getAll('especialidades')).toEqual(['5']);
    req.flush({ status: 'success', statusCode: 200, data: [] });
  });

  it('should request temas with especialidad and tipo params', () => {
    service.getTemas([5], [9]).subscribe();

    const req = httpTestingController.expectOne((request) => {
      return request.method === 'GET' && request.url === `${API_BASE_URL}/cliente/preguntas/temas/`;
    });

    expect(req.request.params.getAll('especialidades')).toEqual(['5']);
    expect(req.request.params.getAll('tipos')).toEqual(['9']);
    req.flush({ status: 'success', statusCode: 200, data: [] });
  });
});
