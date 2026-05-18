
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  points: number;
  qImage?: string;
  aImage?: string;
}

export interface UserAccount {
  username: string;
  password?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export type HelpType = 'think' | 'phone' | 'destruction' | 'change' | 'thief';

export interface CategoryInfo {
  name: string;
  image: string;
}



export interface Team {
  name: string;
  score: number;
  categories: string[];
  helps: HelpType[];
  usedHelps: HelpType[];
}

export interface GameState {
  step: 'login' | 'setup' | 'game' | 'result' | 'admin';
  teams: [Team, Team];
  currentTurn: 0 | 1;
  answeredQuestionIds: string[];
  selectedCategories: string[];
  activeDestruction: number | null; // Team index
  activeThief: number | null; // Team index
}
