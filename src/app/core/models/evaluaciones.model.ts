export interface Intento {
  id_intento: number;
  nombres: string | null;
  apellidos: string | null;
  identificacion: string | null;
  correo: string | null;
  tipo_intento: 'training' | 'examen';
  nombre_intento: string | null;
  temas: string[];
  estado_intento: 'en_progreso' | 'finalizado' | 'vencido';
  puntaje: string | null;
  porcentaje: number | null;
  preguntas: number;
  fecha_creacion: string;
}

export interface IntentoEstudianteInfo {
  tipo_identificacion: string | null;
  identificacion: string | null;
  nombres: string | null;
  apellidos: string | null;
  fecha_nacimiento: string | null;
  username: string;
}

export interface IntentoDetalleAdmin {
  estudiante: IntentoEstudianteInfo;
  intento: {
    id_intento: number;
    estado: string;
    correctas: number;
    total_preguntas: number;
    porcentaje: string;
    puntaje_obtenido: string;
    duracion_real: string;
    fecha_finalizacion: string;
  };
  preguntas: IntentoHistoryQuestion[];
}

export interface IntentoHistoryQuestion {
  id_pregunta: number;
  enunciado: string;
  orden: number;
  id_intento_pregunta: number;
  es_correcta: boolean;
  es_sin_responder: boolean;
  alternativas: {
    id_alternativa_intento: number;
    identificador_numerico: number;
    identificador_letra: string;
    contenido: string;
    es_elegida?: boolean;
    es_correcta?: boolean;
  }[];
  feedback?: { justificacion: string; fuente: string; justificacion_fuente: string } | null;
}

export interface IntentosFiltros {
  page?: number;
  page_size?: number;
  nombres?: string;
  apellidos?: string;
  identificacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface Examen {
  id_examen: number;
  usuario_creacion: string | null;
  nombre: string;
  temas: string[];
  estado_examen: 'proximo' | 'en_prgoreso' | 'finalizado';
  puntaje_maximo: string;
  numero_preguntas: number;
  intentos_entregados: number;
  fecha_inicio: string;
  fecha_entrega: string;
  duracion_minutos: number;
  fecha_creacion: string;
  es_activo: boolean;
}

export interface ExamenesFiltros {
  page?: number;
  page_size?: number;
  nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}
