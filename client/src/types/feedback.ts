// types/feedback.ts
export interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
  }
  
  export interface Feedback {
    id: number;
    strengths: string;
    areasToImprove: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    createdAt: string;
    acknowledged: boolean;
  }
  
  export interface EmployeeWithFeedback {
    employee: Employee;
    feedback_count: number;
    sentiments: {
      POSITIVE: number;
      NEUTRAL: number;
      NEGATIVE: number;
    };
  }