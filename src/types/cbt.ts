export type QuestionType = 'multiple_choice' | 'essay';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  options: QuestionOption[];
  correctAnswer: string; // 'A', 'B', 'C', 'D', 'E' or keywords for essay
  points: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  token: string;
  isActive: boolean;
  shuffleQuestions: boolean;
  showScoreToStudent: boolean;
  allowReviewAnswers: boolean;
  questions: Question[];
  createdAt: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  classGrade: string;
  gender?: 'L' | 'P';
  password?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  password: string;
  role: 'Super Admin' | 'Guru Mapel' | 'Pengawas';
}

export interface Submission {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, string>; // questionId -> answer
  doubtful: Record<string, boolean>; // questionId -> isDoubtful
  tabSwitchViolations: number;
  startedAt: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  percentage: number;
  essayGrading?: Record<string, { score: number; note: string }>;
}

export interface SchoolSettings {
  schoolName: string;
  academicYear: string;
  semester: string;
  examHeader: string;
  adminPin: string;
}

export interface CBTDatabase {
  settings: SchoolSettings;
  admins?: AdminUser[];
  exams: Exam[];
  students: Student[];
  submissions: Submission[];
  lastUpdated: string;
}
