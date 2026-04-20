import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/services/auth.service';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  const authServiceMock = {
    logout: vi.fn(),
    currentUser: signal({ username: 'test', tipo_usuario: 'admin', es_administrador: true, nombre: 'Test User' }),
    isAuthenticated: signal(true),
  };

  beforeEach(async () => {
    authServiceMock.logout.mockReset();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should expose the current user', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance['user']()).toEqual(authServiceMock.currentUser());
  });
});
