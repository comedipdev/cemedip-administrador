import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreguntasComponent } from './preguntas';
import { PreguntasService } from './services/preguntas.service';

describe('PreguntasComponent', () => {
  const preguntasServiceMock = {
    getPreguntas: vi.fn(),
    getEspecialidades: vi.fn(),
    getTipos: vi.fn(),
    getTemas: vi.fn(),
  };

  beforeEach(async () => {
    preguntasServiceMock.getPreguntas.mockReset();
    preguntasServiceMock.getEspecialidades.mockReset();
    preguntasServiceMock.getTipos.mockReset();
    preguntasServiceMock.getTemas.mockReset();

    preguntasServiceMock.getPreguntas.mockReturnValue(
      of({
        status: 'success',
        statusCode: 200,
        data: [
          {
            id_pregunta: 13168,
            enunciado:
              'Mujer de 25 anos, nuligesta, con amenorrea de 9 semanas, presenta leve sangrado genital y un enunciado muy largo para validar que la vista aplique truncado de forma consistente en la tabla.',
            especialidad: 'Gineco-Obstetricia',
            tema: 'Aborto',
            tipo: 'Obstetricia',
            alternativas:
              'A) Aborto diferido, B) Aborto recurrente, C) Aborto septico, D) Aborto incompleto',
            respuesta: 'Aborto diferido',
            feedback: 'Descripcion larga para mostrar una vista resumida sin romper el layout.',
            estado: true,
          },
        ],
        total_data: 1,
        data_paginador: {
          pagina_actual: 1,
          total_paginas: 1,
          total_registros: 1,
          por_pagina: 10,
        },
      }),
    );
    preguntasServiceMock.getEspecialidades.mockReturnValue(
      of({
        status: 'success',
        statusCode: 200,
        data: [{ id_especialidad: 1, nombre: 'Ginecologia' }],
      }),
    );
    preguntasServiceMock.getTipos.mockReturnValue(
      of({ status: 'success', statusCode: 200, data: [] }),
    );
    preguntasServiceMock.getTemas.mockReturnValue(
      of({ status: 'success', statusCode: 200, data: [] }),
    );

    await TestBed.configureTestingModule({
      imports: [PreguntasComponent],
      providers: [provideRouter([]), { provide: PreguntasService, useValue: preguntasServiceMock }, MessageService],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(PreguntasComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should render truncated values for long text cells', async () => {
    const { fixture } = createComponent();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const hostElement = fixture.nativeElement as HTMLElement;
    const truncatedCell = hostElement.querySelector<HTMLSpanElement>(
      'tbody tr td:nth-child(2) span',
    );

    expect(truncatedCell).not.toBeNull();
    expect(truncatedCell?.textContent?.trim().endsWith('...')).toBe(true);
    expect(truncatedCell?.getAttribute('title')).toContain('Mujer de 25 anos');
  });

  it('should request filtered data when searching', async () => {
    const { fixture, component } = createComponent();

    fixture.detectChanges();
    await fixture.whenStable();

    component['filtrosForm'].setValue({
      enunciado: 'aborto',
      alternativa: '',
      respuesta: '',
      especialidad: [1],
      tipo: [],
      tema: [],
      feedback: '',
    });

    component.buscar();
    TestBed.flushEffects();
    await fixture.whenStable();

    expect(preguntasServiceMock.getPreguntas).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 10,
      enunciado: 'aborto',
      alternativa: undefined,
      respuesta: undefined,
      especialidad: [1],
      tipo: null,
      tema: null,
      feedback: undefined,
    });
  });
});
