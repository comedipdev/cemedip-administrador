import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeDefined();
  });

  it('should expose the application title signal', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance['title']()).toBe('cemedip-admin');
  });

  it('should render the router outlet host', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).not.toBeNull();
  });
});
