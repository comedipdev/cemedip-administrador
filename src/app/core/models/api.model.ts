import { HttpErrorResponse } from '@angular/common/http';

export interface ApiSuccessResponse<T> {
  message?: string;
  statusCode: number;
  status: 'success' | string;
  data: T;
  total_data?: number;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode: number;
  status: 'error' | string;
  code?: string;
  details?: unknown;
}

export function extractApiErrorMessage(error: HttpErrorResponse | null | undefined): string {
  const payload = error?.error as ApiErrorResponse | undefined;

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  return 'Ocurrió un error inesperado';
}
