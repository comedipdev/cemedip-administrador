export interface Estudiante {
  id_estudiante: number;
  nombres: string | null;
  apellidos: string | null;
  correo_institucional: string;
  foto_perfil: string | null;
  is_active: boolean;
}

export interface EstudianteDetalle {
  id_estudiante: number;
  tipo_identificacion: string | null;
  identificacion: string | null;
  nombres: string | null;
  apellidos: string | null;
  nombre_completo: string | null;
  correo_institucional: string;
  correo_personal: string | null;
  telefono_convencional: string | null;
  telefono_celular: string | null;
  foto_perfil: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  username: string;
  is_active: boolean;
}

export interface EstudianteCreateInput {
  tipo_identificacion?: string | null;
  identificacion?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  correo_institucional: string;
  correo_personal?: string | null;
  telefono_convencional?: string | null;
  telefono_celular?: string | null;
  direccion?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
}

export interface EstudianteUpdateInput extends Omit<EstudianteCreateInput, 'correo_institucional'> {
  correo_institucional?: string;
  username?: string | null;
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
  is_activo?: boolean;
}

export interface Administrador {
  id_administrador: number;
  nombre: string | null;
  username: string;
  is_active: boolean;
}

export interface AdministradorDetalle {
  id_administrador: number;
  nombre: string | null;
  username: string;
  is_active: boolean;
}

export interface AdministradorCreateInput {
  nombre?: string | null;
  username: string;
}

export interface AdministradorUpdateInput {
  nombre?: string | null;
  username?: string | null;
}

export interface AdministradoresFiltros {
  page?: number;
  page_size?: number;
  nombre?: string;
  is_activo?: boolean;
}
