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

export interface ExamenPreguntaItem {
  id_examen_pregunta: number;
  pregunta_id: number | null;
  orden: number;
  especialidad: string | null;
  codigo: string | null;
  enunciado: string | null;
}

export interface Examen {
  id_examen: number;
  usuario_creacion: string | null;
  nombre: string;
  especialidades: { nombre: string; cantidad: number }[];
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

export interface ExamenDetalle {
  id_examen: number;
  nombre: string;
  descripcion: string | null;
  usuario_creacion: string | null;
  fecha_inicio: string;
  fecha_entrega: string;
  numero_intentos: number;
  duracion_minutos: number;
  numero_preguntas: number;
  puntaje_maximo: string;
  es_activo: boolean;
  especialidades: { especialidad_id: number; especialidad_nombre: string; cantidad: number }[];
  preguntas: ExamenPreguntaItem[];
  fecha_creacion: string;
  estado_examen: string;
}

export interface ExamenFormInput {
  nombre: string;
  descripcion?: string | null;
  usuario_creacion?: string | null;
  fecha_inicio: string;
  fecha_entrega: string;
  numero_intentos: number;
  duracion_minutos: number;
  puntaje_maximo: number;
  es_activo: boolean;
}

export interface ExamenesFiltros {
  page?: number;
  page_size?: number;
  nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ExamenResultadoPregunta {
  orden: number;
  pregunta_id: number;
}

export interface ExamenResultadoIntento {
  id_intento: number;
  nombres: string | null;
  apellidos: string | null;
  identificacion: string | null;
  es_ultimo_intento: boolean;
  estado_intento: 'en_progreso' | 'finalizado' | 'vencido';
  fecha_creacion: string;
  fecha_finalizacion: string | null;
  correctas: number;
  total_preguntas: number;
  porcentaje: string | null;
  puntaje_obtenido: string | null;
  duracion_display: string | null;
  respuestas: Record<string, { estado: 'correcta' | 'incorrecta' | 'sin_responder'; puntaje: string | null }>;
}

export interface ExamenResultadosData {
  preguntas: ExamenResultadoPregunta[];
  intentos: ExamenResultadoIntento[];
}

export interface GraficosPeriodo {
  label: string;
  intentos: number;
  preguntas: number;
  tiempo_segundos: number;
  estudiantes_activos: number;
}

export interface GraficoEstudiante {
  nombres: string;
  apellidos: string;
  identificacion: string;
  total_preguntas?: number;
  total_intentos: number;
  porcentaje_promedio?: number;
}

export interface ReportePreguntaAlternativa {
  identificador_letra: string;
  contenido: string;
  es_elegida: boolean;
  es_correcta: boolean;
}

export interface ReportePregunta {
  id_reporte_pregunta: number;
  fecha_creacion: string;
  razon: string;
  estado_reporte: 'sin_respuesta' | 'solucionado' | 'archivado';
  respuesta_solucion: string | null;
  usuario_respuesta: string | null;
  tipo_intento: 'training' | 'examen';
  pregunta: {
    id_pregunta: number | null;
    codigo: string | null;
    enunciado: string | null;
    especialidad: string | null;
  };
  estudiante: {
    nombres: string | null;
    apellidos: string | null;
    identificacion: string | null;
  };
  alternativas: ReportePreguntaAlternativa[];
}

export interface ReportesFiltros {
  page?: number;
  page_size?: number;
  estado?: string;
}

export interface GraficosEspecialidad {
  especialidad: string;
  correctas: number;
  incorrectas: number;
}

export interface GraficosEspecialidadesPeriodo {
  label: string;
  data: GraficosEspecialidad[];
}

export interface GraficosData {
  periodos: GraficosPeriodo[];
  top_practicantes: GraficoEstudiante[];
  top_rendimiento: GraficoEstudiante[];
  especialidades_periodos: GraficosEspecialidadesPeriodo[];
}
