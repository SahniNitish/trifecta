import Dexie, { type Table } from 'dexie';

export interface Task {
  id?: number;
  title: string;
  done: boolean;
  dueDate?: string;
  priority: 'low' | 'med' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface Transaction {
  id?: number;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note?: string;
  date: string;
}

export interface Budget {
  id?: number;
  category: string;
  monthlyLimit: number;
}

export interface TemplateExercise {
  name: string;
  targetSets: number;
  targetReps: string;
}

export interface WorkoutTemplate {
  id?: number;
  name: string;
  exercises: TemplateExercise[];
  order: number;
}

export interface SessionExercise {
  name: string;
  sets: { weight: number; reps: number }[];
}

export interface WorkoutSession {
  id?: number;
  templateId?: number;
  templateName: string;
  date: string;
  exercises: SessionExercise[];
  durationMin?: number;
  notes?: string;
}

export interface CardioLog {
  id?: number;
  date: string;
  type: 'treadmill';
  durationMin: number;
  speedKmh?: number;
  inclinePct?: number;
  distanceKm?: number;
  calories?: number;
}

export interface BodyMetric {
  id?: number;
  date: string;
  weightKg?: number;
  waistCm?: number;
}

export interface Setting {
  key: string;
  value: string;
}

export class AppDB extends Dexie {
  tasks!: Table<Task>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  workoutTemplates!: Table<WorkoutTemplate>;
  workoutSessions!: Table<WorkoutSession>;
  cardioLogs!: Table<CardioLog>;
  bodyMetrics!: Table<BodyMetric>;
  settings!: Table<Setting, string>;

  constructor() {
    super('personalDashboard');
    this.version(1).stores({
      tasks: '++id, done, dueDate',
      transactions: '++id, date, category, type',
      budgets: '++id, category',
      workoutTemplates: '++id, order',
      workoutSessions: '++id, date, templateId',
      cardioLogs: '++id, date',
      bodyMetrics: '++id, date',
      settings: 'key',
    });
  }
}

export const db = new AppDB();