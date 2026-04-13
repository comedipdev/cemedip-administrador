import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';
import { ActionCardComponent } from './components/action-card/action-card';
import { ProgressCardComponent } from './components/progress-card/progress-card';

@Component({
  selector: 'app-home',
  imports: [TopBarComponent, ActionCardComponent, ProgressCardComponent],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);

  // TODO: Reemplazar con datos reales
  readonly progressItems = signal([
    {
      title: 'EXAMEN DE PRÁCTICA',
      specialty: 'ESPECIALIDAD',
      topic: 'TEMA',
      date: '06/04/2026',
      percentage: 50,
    },
    {
      title: 'EXAMEN DE PRÁCTICA',
      specialty: 'ESPECIALIDAD',
      topic: 'TEMA',
      date: '06/04/2026',
      percentage: 10,
    },
    {
      title: 'EXAMEN DE PRÁCTICA',
      specialty: 'ESPECIALIDAD',
      topic: 'TEMA',
      date: '06/04/2026',
      percentage: 90,
    },
  ]);

  goToTraining(): void {
    void this.router.navigate(['/training']);
  }
}
