import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/services/auth.service';
import { TrainingService } from './services/training.service';
import { TrainingComponent } from './training';

describe('TrainingComponent', () => {
  const authServiceMock = {
    logout: vi.fn(),
    currentUser: signal({ username: 'test', nombre_completo: 'Test User' }),
    isAuthenticated: signal(true),
  };

  const trainingServiceMock = {
    getEspecialidades: vi.fn(() =>
      of({
        data: [
          { id_especialidad: 1, nombre: 'Pediatría' },
          { id_especialidad: 2, nombre: 'Ginecología' },
        ],
      }),
    ),
    getTipos: vi.fn((ids: string[]) =>
      of({
        data: ids.includes('1')
          ? [
              { id_tipo: 11, nombre: 'Diagnóstico' },
              { id_tipo: 12, nombre: 'Emergencia' },
            ]
          : ids.includes('2')
            ? [{ id_tipo: 21, nombre: 'Consulta' }]
            : [],
      }),
    ),
    getTemas: vi.fn((_specialtyIds: string[], typeIds: string[]) =>
      of({
        data: typeIds.includes('11')
          ? [
              { id_tema: 111, nombre: 'Neonatología' },
              { id_tema: 112, nombre: 'Vacunación' },
            ]
          : typeIds.includes('21')
            ? [
                { id_tema: 211, nombre: 'Control prenatal' },
                { id_tema: 212, nombre: 'Salud reproductiva' },
              ]
            : [],
      }),
    ),
    createTraining: vi.fn((request: { numero_preguntas: number }) =>
      of({
        data: {
          id_intento: 54,
          tipo: 'training',
          estado: 'en_progreso',
          fecha_creacion: '2026-04-12T12:45:18.621274-05:00',
          total_preguntas: request.numero_preguntas,
          indice_pregunta_actual: 1,
        },
      }),
    ),
  };

  beforeEach(async () => {
    authServiceMock.logout.mockReset();
    trainingServiceMock.getEspecialidades.mockClear();
    trainingServiceMock.getTipos.mockClear();
    trainingServiceMock.getTemas.mockClear();
    trainingServiceMock.createTraining.mockClear();

    await TestBed.configureTestingModule({
      imports: [TrainingComponent],
      providers: [
        provideRouter([{ path: 'training/session/:id', component: TrainingComponent }]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: TrainingService, useValue: trainingServiceMock },
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TrainingComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    return { fixture, component, router };
  }

  async function settle(fixture: { whenStable: () => Promise<unknown> }) {
    await fixture.whenStable();
  }

  it('should create', () => {
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should load specialties and enable type options after selecting a specialty', async () => {
    const { fixture, component } = createComponent();

    await settle(fixture);
    component.trainingForm.controls.specialty.setValue(['1']);
    await settle(fixture);

    expect(trainingServiceMock.getTipos).toHaveBeenCalledWith(['1']);
    expect(component.availableTypes().length).toBe(2);
    expect(component.trainingForm.controls.type.disabled).toBe(false);
  });

  it('should enable topic options after selecting a type', async () => {
    const { fixture, component } = createComponent();

    await settle(fixture);
    component.trainingForm.controls.specialty.setValue(['1']);
    await settle(fixture);
    component.trainingForm.controls.type.setValue(['11']);
    await settle(fixture);

    expect(trainingServiceMock.getTemas).toHaveBeenCalledWith(['1'], ['11']);
    expect(component.availableTopics().length).toBe(2);
    expect(component.trainingForm.controls.topic.disabled).toBe(false);
  });

  it('should mark the form as touched and avoid starting when invalid', () => {
    const { component } = createComponent();

    component.startTraining();

    expect(trainingServiceMock.createTraining).not.toHaveBeenCalled();
    expect(component.trainingForm.touched).toBe(true);
  });

  it('should create the training, update the summary and navigate to the session', async () => {
    const { fixture, component, router } = createComponent();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await settle(fixture);
    component.trainingForm.controls.specialty.setValue(['2']);
    await settle(fixture);
    component.trainingForm.controls.type.setValue(['21']);
    await settle(fixture);
    component.trainingForm.controls.topic.setValue(['211', '212']);
    component.trainingForm.controls.questionCount.setValue(25);

    component.startTraining();
    await Promise.resolve();

    expect(trainingServiceMock.createTraining).toHaveBeenCalledWith({
      especialidades: [2],
      tipos: [21],
      temas: [211, 212],
      numero_preguntas: 25,
    });
    expect(component.submittedSelection()).toEqual({
      specialties: ['Ginecología'],
      types: ['Consulta'],
      topics: ['Control prenatal', 'Salud reproductiva'],
      questionCount: 25,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/training/session', 54]);
  });
});
