export interface Survey {
  id: number;
  title: string;
  topics: Topic[];
}



export interface Topic {
  id: number;
topicName: string;
  questions: Question[];
}

export interface Question {
  id: number;
  questionText: string;
  options?: Option[]; // Optional for multiple choice questions
  answer?: string; // User's answer
  questionType: 'true_false' | 'multiple_choice' | 'single_choice' | 'longText'| 'shortText'|'number';
  moreOption:boolean
  reason?:string
}

export enum QuestionType {
  Text = 'TEXT',
  YesNo = 'YES_NO',
  MultipleChoice = 'MULTIPLE_CHOICE',
  TrueFalse = 'TRUE_FALSE'
}
 export interface Option {
  value: boolean;
  text:string
  id:number
}
