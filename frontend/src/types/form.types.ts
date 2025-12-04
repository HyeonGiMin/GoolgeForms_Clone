export enum QuestionType {
  ShortAnswer = 0,
  Paragraph = 1,
  MultipleChoice = 2,
  Checkboxes = 3,
  Dropdown = 4,
  LinearScale = 5,
  Date = 6,
  Time = 7
}

export interface Question {
  id?: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface Form {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt?: Date;
  updatedAt?: Date;
  isAcceptingResponses: boolean;
}

export interface Answer {
  questionId: string;
  value: any;
}

export interface FormResponse {
  id?: string;
  formId: string;
  answers: Answer[];
  submittedAt?: Date;
}
