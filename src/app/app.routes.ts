import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('@features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('@features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'training/history',
    loadComponent: () =>
      import('@features/training/history/training-history').then((m) => m.TrainingHistoryComponent),
  },
  {
    path: 'training/session/:idIntento',
    loadComponent: () =>
      import('@features/training/session/training-session').then((m) => m.TrainingSessionComponent),
  },
  {
    path: 'training/session',
    loadComponent: () =>
      import('@features/training/session/training-session').then((m) => m.TrainingSessionComponent),
  },
  {
    path: 'training',
    loadComponent: () => import('@features/training/training').then((m) => m.TrainingComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
