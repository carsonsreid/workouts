export type FitnessModality = 'strength' | 'yoga' | 'cardio';

export type MuscleGroup = 
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Core'
  | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  notes?: string;
  youtubeVideoId?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number;
  notes?: string;
}

export interface ActiveWorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
}

export interface RoutineItem {
  exerciseId: string;
  sets: number;
  targetReps: number;
  targetWeightKg: number;
}

export interface YogaPose {
  id: string;
  name: string;
  sanskritName?: string;
  durationSeconds: number;
  youtubeVideoId: string;
  startTimestampSec: number;
  description: string;
}

export interface CardioMetrics {
  targetDistanceKm: number;
  targetPaceMinPerKm: number;
  inclinePct?: number;
  heartRateZone?: string;
}

export interface Routine {
  id: string;
  name: string;
  tagline: string;
  modality: FitnessModality;
  category: string;
  estimatedMinutes: number;
  items: RoutineItem[];
  yogaPoses?: YogaPose[];
  cardioMetrics?: CardioMetrics;
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  routineId?: string;
  routineName: string;
  modality: FitnessModality;
  date: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  distanceKm?: number;
  exercises: ActiveWorkoutExercise[];
  notes?: string;
  aiReview?: string;
  syncedToSheets?: boolean;
}

export interface AISkill {
  id: string;
  name: string;
  tagline: string;
  category: 'Routine Generator' | 'Daily Review & Gmail' | 'Progressive Overload' | 'Nutrition & Recovery';
  systemPrompt: string;
  userPromptTemplate: string;
  isAutoTriggerEnabled: boolean;
  lastExecutedAt?: string;
}

export interface GoogleSheetsConfig {
  sheetUrl: string;
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface GenerativeIntentPayload {
  intentText: string;
  detectedModality: FitnessModality;
  generatedRoutine: Routine;
  aiReasoning: string;
}
