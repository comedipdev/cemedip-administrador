import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionComponent } from './question';
import { Question } from './question.model';

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;

  const mockQuestion: Question = {
    id: 1,
    text: 'Test Question',
    options: [
      { id: 1, label: 'Option 1', isCorrect: false },
      { id: 2, label: 'Option 2', isCorrect: true },
      { id: 3, label: 'Option 3', isCorrect: false },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', mockQuestion);
    fixture.componentRef.setInput('number', 1);
    fixture.componentRef.setInput('isAnswered', false);
    fixture.componentRef.setInput('selectedOptionId', null);
    fixture.componentRef.setInput('submitting', false);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selection event when an option is clicked and not answered', () => {
    const emitSpy = vi.fn();
    component.selectOptionChange.subscribe(emitSpy);

    component.selectOption(1);

    expect(emitSpy).toHaveBeenCalledWith(1);
  });

  it('should not emit selection event if already answered', async () => {
    const emitSpy = vi.fn();
    component.selectOptionChange.subscribe(emitSpy);
    fixture.componentRef.setInput('isAnswered', true);
    await fixture.whenStable();

    component.selectOption(1);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit selection event while the selected option is submitting', async () => {
    const emitSpy = vi.fn();
    component.selectOptionChange.subscribe(emitSpy);
    fixture.componentRef.setInput('submitting', true);
    await fixture.whenStable();

    component.selectOption(1);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should return correct severity for options when answered', async () => {
    fixture.componentRef.setInput('isAnswered', true);
    fixture.componentRef.setInput('selectedOptionId', 1);
    await fixture.whenStable();

    expect(component.getOptionSeverity(1)).toBe('warn');
    expect(component.getOptionSeverity(2)).toBe('success');
    expect(component.getOptionSeverity(3)).toBe('secondary');
  });

  it('should return primary severity for the selected option before answering', async () => {
    fixture.componentRef.setInput('selectedOptionId', 1);
    await fixture.whenStable();

    expect(component.getOptionSeverity(1)).toBe('primary');
    expect(component.getOptionSeverity(2)).toBe('secondary');
  });
});
