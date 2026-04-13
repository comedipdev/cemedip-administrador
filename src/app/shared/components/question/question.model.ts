export interface QuestionOption {
  id: number;
  label: string;
  isCorrect?: boolean;
  isSelected?: boolean;
}

export interface QuestionFeedback {
  text: string;
  source?: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  feedback?: QuestionFeedback;
}
