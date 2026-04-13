import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerResponseData, TrainingQuestionDetail } from '@core/models/training.model';
import { TrainingService } from '../services/training.service';
import { TrainingSessionComponent } from './training-session';

describe('TrainingSessionComponent', () => {
  let fixture: ComponentFixture<TrainingSessionComponent>;
  let component: TrainingSessionComponent;

  const mockQuestionDetail: TrainingQuestionDetail = {
    id_pregunta: 1,
    enunciado: 'Test Question',
    enunciado_anho: '2024',
    anho: '2024',
    especialidad: { id_especialidad: 1, nombre: 'Medicina' },
    tipo: { id_tipo: 1, nombre: 'Examen' },
    tema: { id_tema: 1, nombre: 'General' },
    alternativas: [
      {
        id_alternativa_intento: 101,
        identificador_numerico: 1,
        identificador_letra: 'a',
        contenido: 'Option A',
      },
    ],
  };

  const mockAnswerResponse: AnswerResponseData = {
    orden: 1,
    id_intento_pregunta: 939,
    es_correcta: true,
    es_sin_responder: false,
    feedback: {
      justificacion: 'Correct because of X',
      fuente: 'Source Y',
      justificacion_fuente: '...',
    },
    alternativas: [
      {
        id_alternativa_intento: 101,
        identificador_numerico: 1,
        identificador_letra: 'a',
        contenido: 'Option A',
        es_elegida: true,
        es_correcta: true,
      },
    ],
    indice_pregunta_actual: 1,
    total_preguntas: 10,
  };

  const mockAttempt = {
    id_intento: 1,
    tipo: 'training',
    estado: 'en_progreso',
    fecha_creacion: '2024-04-13T12:00:00Z',
    total_preguntas: 10,
    indice_pregunta_actual: 1,
  };

  const mockFinishResult = {
    id_intento: 1,
    estado: 'finalizado',
    correctas: 8,
    total_preguntas: 10,
    porcentaje: '80.00',
    puntaje_obtenido: '8.00',
    duracion_real: '00:10:00',
    fecha_finalizacion: '2024-04-13T12:00:00Z',
  };

  const trainingServiceMock = {
    getTrainingAttempt: vi.fn(() => of({ data: mockAttempt })),
    getQuestion: vi.fn(() => of(mockQuestionDetail)),
    answerQuestion: vi.fn(() => of({ data: mockAnswerResponse })),
    finishTraining: vi.fn(() => of({ data: mockFinishResult })),
  };

  beforeEach(async () => {
    trainingServiceMock.getTrainingAttempt.mockClear();
    trainingServiceMock.getQuestion.mockClear();
    trainingServiceMock.answerQuestion.mockClear();
    trainingServiceMock.finishTraining.mockClear();

    await TestBed.configureTestingModule({
      imports: [TrainingSessionComponent],
      providers: [
        { provide: TrainingService, useValue: trainingServiceMock },
        provideRouter([
          { path: 'training/history', component: TrainingSessionComponent },
          { path: 'home', component: TrainingSessionComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingSessionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idIntento', 1);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with values from attempt and question resources', () => {
    expect(trainingServiceMock.getTrainingAttempt).toHaveBeenCalledWith(1);
    expect(trainingServiceMock.getQuestion).toHaveBeenCalledWith(1, 1);
    expect(component.idIntento()).toBe(1);
    expect(component.currentQuestionIndex()).toBe(1);
    expect(component.currentQuestion()?.text).toBe(mockQuestionDetail.enunciado);
  });

  it('should submit the selected option and expose the answered feedback', () => {
    const optionId = mockQuestionDetail.alternativas[0]!.id_alternativa_intento;

    component.selectOption(optionId);

    expect(trainingServiceMock.answerQuestion).toHaveBeenCalledWith(1, 1, optionId);
    expect(component.selectedOptionId()).toBe(optionId);
    expect(component.isAnswered()).toBe(true);
    expect(component.currentQuestion()?.feedback).toEqual({
      text: mockAnswerResponse.feedback.justificacion,
      source: mockAnswerResponse.feedback.fuente,
    });
  });

  it('should not resubmit an answer once the question was already answered', () => {
    const optionId = mockQuestionDetail.alternativas[0]!.id_alternativa_intento;

    component.selectOption(optionId);
    component.selectOption(optionId);

    expect(trainingServiceMock.answerQuestion).toHaveBeenCalledTimes(1);
  });

  it('should reset answer state and advance to the next question', () => {
    component.selectOption(101);

    component.nextQuestion();

    expect(component.currentQuestionIndex()).toBe(2);
    expect(component.selectedOptionId()).toBeNull();
    expect(component.isAnswered()).toBe(false);
  });

  it('should call finishTraining and show the results modal on the last question', () => {
    component.currentQuestionIndex.set(10);
    component.selectOption(101);

    component.nextQuestion();

    expect(trainingServiceMock.finishTraining).toHaveBeenCalledWith(1);
    expect(component.showResultModal()).toBe(true);
    expect(component.finishResult()).toEqual(mockFinishResult);
  });

  it('should recover submission state when answerQuestion fails', () => {
    trainingServiceMock.answerQuestion.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.selectOption(101);

    expect(component.isSubmitting()).toBe(false);
    expect(component.isAnswered()).toBe(false);
  });

  it('should navigate to home when goToHome is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.goToHome();

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});
