export interface LoginRequest {
  username: string;
  password: string;
  aplicacion: string;
}

export interface RecoverPasswordRequest {
  correo: string;
}

export interface ConfirmPasswordRequest {
  token: string;
  nueva_contrasena: string;
}

export interface User {
  username: string;
  nombre_completo: string;
}

export interface LoginData {
  token: string;
  usuario: User;
}
