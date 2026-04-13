import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';
import { QuestionComponent } from '@shared/components/question/question';
import { Question } from '@shared/components/question/question.model';
import {
  TrainingAttempt,
  AnswerResponseData,
  TrainingQuestionDetail,
  TrainingAttemptResult,
} from '@core/models/training.model';
import { TrainingService } from '../services/training.service';

@Component({
  selector: 'app-training-session',
  imports: [
    CommonModule,
    ButtonModule,
    ProgressBarModule,
    DialogModule,
    TopBarComponent,
    QuestionComponent,
  ],
  templateUrl: './training-session.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingSessionComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly trainingService = inject(TrainingService);

  readonly idIntento = input.required<number, string | number>({
    transform: (v) => Number(v),
  });

  readonly attemptResource = rxResource<TrainingAttempt, { idIntento: number }>({
    params: () => ({ idIntento: this.idIntento() }),
    stream: ({ params: { idIntento } }) => {
      return this.trainingService.getTrainingAttempt(idIntento).pipe(map((res) => res.data));
    },
  });

  readonly currentQuestionIndex = linkedSignal(
    () => this.attemptResource.value()?.indice_pregunta_actual ?? 1,
  );

  readonly totalQuestions = computed(() => this.attemptResource.value()?.total_preguntas ?? 0);

  readonly questionResource = rxResource<
    TrainingQuestionDetail,
    { idIntento: number; currentQuestionIndex: number }
  >({
    params: () => ({
      idIntento: this.idIntento(),
      currentQuestionIndex: this.currentQuestionIndex(),
    }),
    stream: ({ params: { idIntento, currentQuestionIndex } }) => {
      return this.trainingService.getQuestion(idIntento, currentQuestionIndex);
    },
  });

  readonly answeredResult = signal<AnswerResponseData | null>(null);
  readonly finishResult = signal<TrainingAttemptResult | null>(null);
  readonly showResultModal = signal(false);

  readonly currentQuestion = computed<Question | null>(() => {
    const question = this.questionResource.value();
    const result = this.answeredResult();

    if (!question) return null;

    const alternativas = result?.alternativas ?? question.alternativas;
    const feedback = result?.feedback ?? question.feedback;

    return {
      id: question.id_pregunta,
      text: question.enunciado,
      options: alternativas.map((alt) => ({
        id: alt.id_alternativa_intento,
        label: alt.contenido,
        isCorrect: alt.es_correcta,
        isSelected: alt.es_elegida,
      })),
      feedback: feedback
        ? {
            text: feedback.justificacion,
            source: feedback.fuente,
          }
        : undefined,
    };
  });

  readonly isLoading = computed(() => this.questionResource.isLoading());
  readonly isSubmitting = signal(false);
  readonly isFinishing = signal(false);
  readonly selectedOptionId = signal<number | null>(null);
  readonly isAnswered = computed(() => !!this.answeredResult());
  readonly secondsElapsed = signal(0);
  private timerInterval?: ReturnType<typeof setInterval>;

  readonly progress = computed(() => {
    const total = this.totalQuestions();
    return total > 0 ? (this.currentQuestionIndex() / total) * 100 : 0;
  });

  readonly formattedTime = computed(() => {
    const minutes = Math.floor(this.secondsElapsed() / 60);
    const seconds = this.secondsElapsed() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  readonly progressBarPt = {
    root: { class: 'h-2 border-none bg-surface-200 rounded-full' },
    value: { class: 'rounded-full' },
  };

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.secondsElapsed.update((s) => s + 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  selectOption(optionId: number): void {
    if (this.isAnswered() || this.isSubmitting()) return;

    this.selectedOptionId.set(optionId);
    this.isSubmitting.set(true);

    this.trainingService
      .answerQuestion(this.idIntento(), this.currentQuestionIndex(), optionId)
      .subscribe({
        next: (response) => {
          this.answeredResult.set(response.data);
          this.isSubmitting.set(false);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  nextQuestion(): void {
    const nextIndex = this.currentQuestionIndex() + 1;
    if (nextIndex <= this.totalQuestions()) {
      this.currentQuestionIndex.set(nextIndex);
      this.selectedOptionId.set(null);
      this.answeredResult.set(null);
    } else {
      this.finishTraining();
    }
  }

  private finishTraining(): void {
    this.isFinishing.set(true);
    this.stopTimer();

    this.trainingService.finishTraining(this.idIntento()).subscribe({
      next: (response) => {
        this.finishResult.set(response.data);
        this.showResultModal.set(true);
        this.isFinishing.set(false);
      },
      error: () => {
        this.isFinishing.set(false);
        console.log('Error finishing training attempt');
      },
    });
  }

  goToHome(): void {
    void this.router.navigate(['/home']);
  }
}
