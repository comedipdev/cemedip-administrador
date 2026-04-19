import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private ms = inject(MessageService);

  success(detail: string, summary = 'Éxito') {
    this.ms.add({ severity: 'success', summary, detail, life: 4000 });
  }

  error(detail: string, summary = 'Error') {
    this.ms.add({ severity: 'error', summary, detail, life: 6000 });
  }

  info(detail: string, summary = 'Información') {
    this.ms.add({ severity: 'info', summary, detail, life: 4000 });
  }

  warn(detail: string, summary = 'Atención') {
    this.ms.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  show(severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string, life = 4000) {
    this.ms.add({ severity, summary, detail, life });
  }
}
