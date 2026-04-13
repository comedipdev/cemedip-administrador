import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormFieldComponent } from '@shared/components/form-field/form-field';
import { OptionGridComponent, OptionGridItem } from '@shared/components/option-grid/option-grid';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';
import { CreateTrainingRequest } from '@core/models/training.model';
import { TrainingService } from './services/training.service';

interface TrainingTopicOption {
  label: string;
  value: string;
}

interface TrainingTypeOption {
  label: string;
  value: string;
}

interface TrainingSpecialtyOption {
  label: string;
  value: string;
}

interface TrainingSelectionSummary {
  specialties: string[];
  types: string[];
  topics: string[];
  questionCount: number;
}

const QUESTION_OPTIONS: OptionGridItem<number>[] = [5, 10, 20, 25, 30, 40, 50, 100].map(
  (value) => ({
    label: `${value} preguntas`,
    value,
  }),
);

@Component({
  selector: 'app-training',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    MultiSelectModule,
    FormFieldComponent,
    OptionGridComponent,
    TopBarComponent,
  ],
  templateUrl: './training.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly trainingService = inject(TrainingService);

  private readonly specialtiesResource = rxResource<TrainingSpecialtyOption[], void>({
    stream: () =>
      this.trainingService.getEspecialidades().pipe(
        map((response) =>
          response.data.map((item) => ({
            label: item.nombre,
            value: item.id_especialidad.toString(),
          })),
        ),
      ),
  });

  readonly specialties = computed(() => this.specialtiesResource.value() ?? []);
  readonly loading = computed(
    () =>
      this.specialtiesResource.isLoading() ||
      this.typesResource.isLoading() ||
      this.topicsResource.isLoading(),
  );
  readonly isStarting = signal(false);
  readonly questionOptions = signal(QUESTION_OPTIONS);

  readonly trainingForm = this.fb.group({
    specialty: this.fb.nonNullable.control<string[]>([], Validators.required),
    type: this.fb.nonNullable.control<string[]>({ value: [], disabled: true }, Validators.required),
    topic: this.fb.nonNullable.control<string[]>(
      { value: [], disabled: true },
      Validators.required,
    ),
    questionCount: this.fb.nonNullable.control(50, Validators.required),
  });

  private readonly specialtyValue = toSignal(this.trainingForm.controls.specialty.valueChanges, {
    initialValue: this.trainingForm.controls.specialty.value,
  });

  private readonly typesResource = rxResource<TrainingTypeOption[], string[]>({
    params: () => this.specialtyValue(),
    stream: ({ params: specialties }) => {
      if (!specialties || specialties.length === 0) {
        return of([]);
      }
      return this.trainingService.getTipos(specialties).pipe(
        map((response) =>
          response.data.map((item) => ({
            label: item.nombre,
            value: item.id_tipo.toString(),
          })),
        ),
      );
    },
  });

  private readonly typeValue = toSignal(this.trainingForm.controls.type.valueChanges, {
    initialValue: this.trainingForm.controls.type.value,
  });

  private readonly topicsResource = rxResource<
    TrainingTopicOption[],
    { specialties: string[]; types: string[] }
  >({
    params: () => ({ specialties: this.specialtyValue(), types: this.typeValue() }),
    stream: ({ params: { specialties, types } }) => {
      if (!specialties || specialties.length === 0 || !types || types.length === 0) {
        return of([]);
      }
      return this.trainingService.getTemas(specialties, types).pipe(
        map((response) =>
          response.data.map((item) => ({
            label: item.nombre,
            value: item.id_tema.toString(),
          })),
        ),
      );
    },
  });

  private readonly formStatus = toSignal(this.trainingForm.statusChanges, {
    initialValue: this.trainingForm.status,
  });

  readonly availableTypes = computed(() => this.typesResource.value() ?? []);
  readonly availableTopics = computed(() => this.topicsResource.value() ?? []);
  readonly canStart = computed(() => this.formStatus() === 'VALID' && !this.isStarting());
  readonly specialtyInvalid = computed(() => {
    const control = this.trainingForm.controls.specialty;
    return control.invalid && control.touched;
  });
  readonly typeInvalid = computed(() => {
    const control = this.trainingForm.controls.type;
    return control.invalid && control.touched;
  });
  readonly topicInvalid = computed(() => {
    const control = this.trainingForm.controls.topic;
    return control.invalid && control.touched;
  });
  readonly submittedSelection = signal<TrainingSelectionSummary | null>(null);
  readonly multiselectPt = {
    root: { class: 'border-surface-200 bg-surface-100' },
    overlay: { class: 'border-surface-200' },
    header: { class: 'border-b border-surface-200 bg-surface-0' },
    listContainer: { class: 'bg-surface-0' },
    emptyMessage: { class: 'px-4 py-3 text-sm text-surface-500' },
  };
  readonly headerActionPt = {
    root: { class: 'h-11 px-6 text-sm font-semibold tracking-[0.08em] uppercase shadow-none' },
    label: { class: 'px-0' },
  };
  readonly primaryActionPt = {
    root: { class: 'h-14 min-w-52 px-10 text-base font-semibold tracking-[0.12em] uppercase' },
    label: { class: 'px-0' },
  };

  constructor() {
    effect(() => {
      const types = this.availableTypes();
      const typeControl = this.trainingForm.controls.type;
      const topicControl = this.trainingForm.controls.topic;

      if (types.length === 0) {
        typeControl.setValue([], { emitEvent: false });
        typeControl.disable({ emitEvent: false });
        topicControl.setValue([], { emitEvent: false });
        topicControl.disable({ emitEvent: false });
        return;
      }

      if (typeControl.disabled) {
        typeControl.enable({ emitEvent: false });
      }

      const availableTypeValues = new Set(types.map((type) => type.value));
      const filteredTypes = typeControl.value.filter((type) => availableTypeValues.has(type));

      if (filteredTypes.length !== typeControl.value.length) {
        typeControl.setValue(filteredTypes, { emitEvent: false });
      }
    });

    effect(() => {
      const topics = this.availableTopics();
      const topicControl = this.trainingForm.controls.topic;

      if (topics.length === 0) {
        topicControl.setValue([], { emitEvent: false });
        topicControl.disable({ emitEvent: false });
        return;
      }

      if (topicControl.disabled) {
        topicControl.enable({ emitEvent: false });
      }

      const availableTopicValues = new Set(topics.map((topic) => topic.value));
      const filteredTopics = topicControl.value.filter((topic) => availableTopicValues.has(topic));

      if (filteredTopics.length !== topicControl.value.length) {
        topicControl.setValue(filteredTopics, { emitEvent: false });
      }
    });
  }

  startTraining(): void {
    if (!this.canStart()) {
      this.trainingForm.markAllAsTouched();
      return;
    }

    const rawValue = this.trainingForm.getRawValue();
    const request: CreateTrainingRequest = {
      especialidades: rawValue.specialty.map(Number),
      tipos: rawValue.type.map(Number),
      temas: rawValue.topic.map(Number),
      numero_preguntas: rawValue.questionCount,
    };

    this.isStarting.set(true);
    this.trainingService.createTraining(request).subscribe({
      next: (response) => {
        this.isStarting.set(false);
        this.submittedSelection.set({
          specialties: this.resolveSpecialtyLabels(rawValue.specialty),
          types: this.resolveTypeLabels(rawValue.type),
          topics: this.resolveTopicLabels(rawValue.topic),
          questionCount: rawValue.questionCount,
        });

        const attempt = response.data;
        void this.router.navigate(['/training/session', attempt.id_intento]);
      },
      error: (error) => {
        this.isStarting.set(false);
        console.error('Error al iniciar el entrenamiento:', error);
      },
    });
  }

  formatSelectionSummary(values: string[]): string {
    return values.join(', ');
  }

  private resolveSpecialtyLabels(specialtyValues: string[]): string[] {
    const selectedSpecialties = new Set(specialtyValues);

    return this.specialties()
      .filter((item) => selectedSpecialties.has(item.value))
      .map((item) => item.label);
  }

  private resolveTypeLabels(typeValues: string[]): string[] {
    const selectedTypes = new Set(typeValues);

    return this.availableTypes()
      .filter((item) => selectedTypes.has(item.value))
      .map((item) => item.label);
  }

  private resolveTopicLabels(topicValues: string[]): string[] {
    const selectedTopics = new Set(topicValues);

    return this.availableTopics()
      .filter((item) => selectedTopics.has(item.value))
      .map((item) => item.label);
  }

  goToHistory(): void {
    void this.router.navigate(['/training/history']);
  }
}
