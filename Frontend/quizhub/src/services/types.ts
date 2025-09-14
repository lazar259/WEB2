// API Request and Response Types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: string; // Base64 encoded string
  profilePictureName: string; // Original filename
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

// Quiz-related types
export enum DifficultyLevel {
  Easy = 0,
  Medium = 1,
  Hard = 2
}

export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
  TrueFalse = 2,
  FillInTheBlank = 3
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
}

export interface QuestionOptionResponse {
  id: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  type: QuestionType;
  points: number;
  order: number;
  explanation?: string;
  correctAnswer?: string;
  options: QuestionOptionResponse[];
}

export interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  topic: string;
  difficulty: DifficultyLevel;
  timeLimitInMinutes: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdByUser: UserInfo;
  questions: QuestionResponse[];
}

export interface QuizSummaryResponse {
  id: number;
  title: string;
  description?: string;
  topic: string;
  difficulty: DifficultyLevel;
  timeLimitInMinutes: number;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdByUser: UserInfo;
}

export interface CreateQuestionOptionRequest {
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface CreateQuestionRequest {
  questionText: string;
  type: QuestionType;
  points: number;
  order: number;
  explanation?: string;
  correctAnswer?: string;
  options: CreateQuestionOptionRequest[];
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  topic: string;
  difficulty: DifficultyLevel;
  timeLimitInMinutes: number;
  questions: CreateQuestionRequest[];
}

export interface UpdateQuestionOptionRequest {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface UpdateQuestionRequest {
  id?: number;
  questionText: string;
  type: QuestionType;
  points: number;
  order: number;
  explanation?: string;
  correctAnswer?: string;
  options: UpdateQuestionOptionRequest[];
}

export interface UpdateQuizRequest {
  title: string;
  description?: string;
  topic: string;
  difficulty: DifficultyLevel;
  timeLimitInMinutes: number;
  isActive: boolean;
  questions: UpdateQuestionRequest[];
}

// Quiz Attempt types
export interface StartQuizRequest {
  quizId: number;
}

export interface SubmitAnswerRequest {
  questionId: number;
  userAnswer?: string;
  selectedOptionIds: number[];
}

export interface QuizAnswerResponse {
  questionId: number;
  questionText: string;
  userAnswer?: string;
  selectedOptionIds: number[];
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: string;
}

export interface QuizAttemptResponse {
  id: number;
  quizId: number;
  quizTitle: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  maxScore: number;
  percentage: number;
  isCompleted: boolean;
  timeSpentInSeconds: number;
  answers: QuizAnswerResponse[];
}

export interface QuizSessionResponse {
  attemptId: number;
  quiz: QuizResponse;
  startedAt: string;
  timeRemainingInSeconds: number;
  currentAnswers: QuizAnswerResponse[];
}