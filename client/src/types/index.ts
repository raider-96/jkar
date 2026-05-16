
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeType = 'text' | 'image' | 'act' | 'sound';

export interface Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  points: number;
  image?: string;
  type?: ChallengeType;
  options?: string[];
}

export interface UserAccount {
  username: string;
  password?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface Team {
  name: string;
  score: number;
  categories: string[];
}

export interface GameState {
  step: 'login' | 'setup' | 'game' | 'result' | 'admin';
  teams: [Team, Team];
  currentTurn: 0 | 1;
  answeredQuestionIds: string[];
  selectedCategories: string[];
}
