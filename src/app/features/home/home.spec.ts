import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/services/auth.service';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  const authServiceMock = {
    logout: vi.fn(),
    currentUser: signal({ username: 'test', nombre_completo: 'Test User' }),
    isAuthenticated: signal(true),
  };

  beforeEach(async () => {
    authServiceMock.logout.mockReset();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    return { fixture, component, router };
  }

  it('should create', () => {
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should expose seeded progress items', () => {
    const { component } = createComponent();

    expect(component.progressItems().length).toBe(3);
    expect(component.progressItems()[0]?.title).toBe('EXAMEN DE PRÁCTICA');
  });

  it('should navigate to training', () => {
    const { component, router } = createComponent();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.goToTraining();

    expect(navigateSpy).toHaveBeenCalledWith(['/training']);
  });
});
