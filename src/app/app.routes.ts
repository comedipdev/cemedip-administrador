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
        path: 'evaluaciones/examenes',
        loadComponent: () =>
          import('@features/evaluaciones/examenes/examenes').then((m) => m.ExamenesComponent),
      },
      {
        path: 'evaluaciones/examenes/nuevo',
        loadComponent: () =>
          import('@features/evaluaciones/examen-form/examen-form').then((m) => m.ExamenFormComponent),
        children: [
          {
            path: 'configuracion',
            loadComponent: () =>
              import('@features/evaluaciones/examen-form/configuracion/configuracion').then((m) => m.ExamenConfiguracionComponent),
          },
          { path: '', redirectTo: 'configuracion', pathMatch: 'full' },
        ],
      },
      {
        path: 'evaluaciones/examenes/:id',
        loadComponent: () =>
          import('@features/evaluaciones/examen-form/examen-form').then((m) => m.ExamenFormComponent),
        children: [
          {
            path: 'configuracion',
            loadComponent: () =>
              import('@features/evaluaciones/examen-form/configuracion/configuracion').then((m) => m.ExamenConfiguracionComponent),
          },
          {
            path: 'cuestionario',
            loadComponent: () =>
              import('@features/evaluaciones/examen-form/cuestionario/cuestionario').then((m) => m.ExamenCuestionarioComponent),
          },
          {
            path: 'preguntas',
            loadComponent: () =>
              import('@features/evaluaciones/examen-form/preguntas/preguntas').then((m) => m.ExamenPreguntasComponent),
          },
          {
            path: 'resultados',
            loadComponent: () =>
              import('@features/evaluaciones/examen-form/resultados/resultados').then((m) => m.ExamenResultadosComponent),
          },
          { path: '', redirectTo: 'configuracion', pathMatch: 'full' },
        ],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
