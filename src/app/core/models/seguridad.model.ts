export interface Estudiante {
  id_estudiante: number;
  nombres: string | null;
  apellidos: string | null;
  correo_institucional: string;
  foto_perfil: string | null;
}

export interface Paginador {
  pagina_actual: number;
  total_paginas: number;
  total_registros: number;
  por_pagina: number;
}

export interface EstudiantesFiltros {
  page?: number;
  page_size?: number;
  nombres?: string;
  apellidos?: string;
  correo_institucional?: string;
  id_estudiante?: number;
}
