export interface TemaEspecialidad {
  id_tema: number;
  nombre: string;
}

export interface TipoEspecialidad {
  id_tipo: number;
  nombre: string;
}

export interface Especialidad {
  id_especialidad: number;
  nombre: string;
}

export interface CreateTrainingRequest {
  especialidades: number[];
  tipos: number[];
  temas: number[];
  numero_preguntas: number;
}

export interface TrainingAttempt {
  id_intento: number;
  tipo: string;
  estado: string;
  fecha_creacion: string;
  total_preguntas: number;
  indice_pregunta_actual: number;
}

export interface TrainingQuestionAlternativa {
  id_alternativa_intento: number;
  identificador_numerico: number;
  identificador_letra: string;
  contenido: string;
  es_elegida?: boolean;
  es_correcta?: boolean;
}

export interface AnswerFeedback {
  justificacion: string;
  fuente: string;
  justificacion_fuente: string;
}

export interface TrainingQuestionDetail {
  id_pregunta: number;
  enunciado: string;
  enunciado_anho: string;
  anho: string;
  especialidad: Especialidad;
  tipo: TipoEspecialidad;
  tema: TemaEspecialidad;
  alternativas: TrainingQuestionAlternativa[];
  feedback?: AnswerFeedback;
}

export interface TrainingQuestion {
  orden: number;
  id_intento_pregunta: number;
  pregunta: TrainingQuestionDetail;
}

export interface AnswerResponseData {
  orden: number;
  id_intento_pregunta: number;
  es_correcta: boolean;
  es_sin_responder: boolean;
  feedback: AnswerFeedback;
  alternativas: TrainingQuestionAlternativa[];
  indice_pregunta_actual: number;
  total_preguntas: number;
}

export interface TrainingAttemptResult {
  id_intento: number;
  estado: string;
  correctas: number;
  total_preguntas: number;
  porcentaje: string;
  puntaje_obtenido: string;
  duracion_real: string;
  fecha_finalizacion: string;
}
