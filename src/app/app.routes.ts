import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('@shared/components/admin-shell/admin-shell').then((m) => m.AdminShellComponent),
    children: [
      {
        path: 'preguntas',
        loadComponent: () =>
          import('@features/preguntas/preguntas').then((m) => m.PreguntasComponent),
      },
      {
        path: 'preguntas/nuevo',
        loadComponent: () =>
          import('@features/preguntas/pregunta-form/pregunta-form').then(
            (m) => m.PreguntaFormComponent,
          ),
      },
      {
        path: 'preguntas/:id',
        loadComponent: () =>
          import('@features/preguntas/pregunta-form/pregunta-form').then(
            (m) => m.PreguntaFormComponent,
          ),
      },
      {
        path: 'home',
        loadComponent: () => import('@features/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'seguridad/estudiantes',
        loadComponent: () =>
          import('@features/seguridad/estudiantes/estudiantes').then((m) => m.EstudiantesComponent),
      },
      {
        path: 'seguridad/estudiantes/nuevo',
        loadComponent: () =>
          import('@features/seguridad/estudiante-form/estudiante-form').then(
            (m) => m.EstudianteFormComponent,
          ),
      },
      {
        path: 'seguridad/estudiantes/:id',
        loadComponent: () =>
          import('@features/seguridad/estudiante-form/estudiante-form').then(
            (m) => m.EstudianteFormComponent,
          ),
      },
      {
        path: 'evaluaciones/intentos/:id',
        loadComponent: () =>
          import('@features/evaluaciones/intento-detalle/intento-detalle').then((m) => m.IntentoDetalleComponent),
      },
      {
        path: 'evaluaciones/intentos',
        loadComponent: () =>
          import('@features/evaluaciones/intentos/intentos').then((m) => m.IntentosComponent),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
