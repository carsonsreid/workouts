import { Exercise, Routine, WorkoutLog, AISkill, GoogleSheetsConfig } from '../types';

const STORAGE_KEYS = {
  EXERCISES: 'pulse_exercises_v3',
  ROUTINES: 'pulse_routines_v3',
  LOGS: 'pulse_workout_logs_v3',
  SKILLS: 'pulse_ai_skills_v3',
  SHEETS_CONFIG: 'pulse_sheets_config_v3',
};

// Seed Exercises based on Cavaliere, Nippard & Huberman Blueprint
export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-1', name: 'Poliquin Step-Up (Heel Elevated)', category: 'Bodyweight', muscleGroup: 'Legs', defaultSets: 2, defaultReps: 12, defaultWeightKg: 0, youtubeVideoId: 'j97SSGsnCAQ', notes: 'Elevated heel on slant/plate. Targets terminal extension and VMO for patellar tendon stability.' },
  { id: 'ex-2', name: 'Barbell Back Squat (HSR 3s Eccentric)', category: 'Barbell', muscleGroup: 'Legs', defaultSets: 2, defaultReps: 6, defaultWeightKg: 95, youtubeVideoId: 'SW_C1A-rejs', notes: 'Slow 3-4s eccentric phase for Heavy Slow Resistance tendon remodeling.' },
  { id: 'ex-3', name: 'Landmine Romanian Deadlift', category: 'Landmine', muscleGroup: 'Legs', defaultSets: 2, defaultReps: 10, defaultWeightKg: 60, youtubeVideoId: 'JCXUYuzwNrM', notes: 'Landmine arc naturally guides hip hinge while sparing lumbar spine.' },
  { id: 'ex-4', name: 'Weighted Ring Pull-Up', category: 'Bodyweight', muscleGroup: 'Back', defaultSets: 2, defaultReps: 8, defaultWeightKg: 10, youtubeVideoId: 'CAwf7n6Luuc', notes: 'Gymnastic rings allow natural wrist rotation to minimize shoulder stress.' },
  { id: 'ex-5', name: 'Dumbbell Bench Press (Lengthened Partials)', category: 'Dumbbell', muscleGroup: 'Chest', defaultSets: 2, defaultReps: 10, defaultWeightKg: 34, youtubeVideoId: '8iPEnn-ltC8', notes: 'Emphasize deep stretch at bottom position for mechanical tension.' },
  { id: 'ex-6', name: 'High-to-Low Banded Face Pull', category: 'Cable', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15, defaultWeightKg: 15, youtubeVideoId: '3VcKaXpzqRo', notes: 'Underhand thumbs-back grip ("beat hands backward") into 90/90 goalpost finish.' },
  { id: 'ex-7', name: 'Pallof Press (Anti-Rotation)', category: 'Cable', muscleGroup: 'Core', defaultSets: 3, defaultReps: 10, defaultWeightKg: 20, youtubeVideoId: 'nRiJVSRCdmw', notes: 'Press handle straight out, resisting twisting force to bulletproof lumbar spine.' },
  { id: 'ex-8', name: 'Isometric Wall Sit (45s Analgesia)', category: 'Bodyweight', muscleGroup: 'Legs', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, youtubeVideoId: 'j97SSGsnCAQ', notes: '45s hold at 60° knee flexion for immediate patellar tendon analgesia (Rio et al.).' },
];

// Seed 5-Day Synthesized Basement Protocol Routines
export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'rot-mon-knee',
    name: 'Monday: Lower Body Strength & Knee Remediation',
    tagline: 'Poliquin step-ups, HSR squatting, Landmine RDLs, VMO isolation & tendon analgesia',
    modality: 'strength',
    category: 'Strength Training',
    estimatedMinutes: 45,
    createdAt: new Date().toISOString(),
    items: [
      { exerciseId: 'ex-8', sets: 1, targetReps: 1, targetWeightKg: 0 },
      { exerciseId: 'ex-1', sets: 2, targetReps: 12, targetWeightKg: 0 },
      { exerciseId: 'ex-2', sets: 2, targetReps: 6, targetWeightKg: 95 },
      { exerciseId: 'ex-3', sets: 2, targetReps: 10, targetWeightKg: 60 },
    ]
  },
  {
    id: 'rot-tue-recovery',
    name: 'Tuesday: Travel Recovery & Contrast Therapy',
    tagline: '20-30 min Zone 2 Rowing + Sauna/Cold Plunge contrast ending on cold (Søberg Principle)',
    modality: 'cardio',
    category: 'Cardio Conditioning',
    estimatedMinutes: 30,
    createdAt: new Date().toISOString(),
    items: [],
    cardioMetrics: {
      targetDistanceKm: 4.0,
      targetPaceMinPerKm: 5.30,
      inclinePct: 0,
      heartRateZone: 'Zone 2 (130-145 BPM)'
    }
  },
  {
    id: 'rot-wed-upper',
    name: 'Wednesday: Upper Body Hypertrophy & Posture',
    tagline: 'Weighted ring pull-ups, DB bench with lengthened partials, face pulls & core fallouts',
    modality: 'strength',
    category: 'Strength Training',
    estimatedMinutes: 45,
    createdAt: new Date().toISOString(),
    items: [
      { exerciseId: 'ex-4', sets: 2, targetReps: 8, targetWeightKg: 10 },
      { exerciseId: 'ex-5', sets: 2, targetReps: 10, targetWeightKg: 34 },
      { exerciseId: 'ex-6', sets: 3, targetReps: 15, targetWeightKg: 15 },
    ]
  },
  {
    id: 'rot-fri-vo2max',
    name: 'Friday: VO2 Max Norwegian 4x4 & Core',
    tagline: 'Rowing HIIT (4x4 min at 90-95% HR max) + Pallof press anti-rotation core',
    modality: 'cardio',
    category: 'Cardio Conditioning',
    estimatedMinutes: 35,
    createdAt: new Date().toISOString(),
    items: [
      { exerciseId: 'ex-7', sets: 3, targetReps: 10, targetWeightKg: 20 },
    ],
    cardioMetrics: {
      targetDistanceKm: 5.0,
      targetPaceMinPerKm: 4.45,
      inclinePct: 0,
      heartRateZone: 'Zone 5 Norwegian 4x4 (170-185 BPM)'
    }
  },
  {
    id: 'rot-sun-autonomic',
    name: 'Sunday: Family Yoga & Autonomic Reset',
    tagline: '15 min static stretching (30-40% pain threshold) + 20 min NSDR / Yoga Nidra',
    modality: 'yoga',
    category: 'Yoga & Mobility',
    estimatedMinutes: 35,
    createdAt: new Date().toISOString(),
    items: [],
    yogaPoses: [
      { id: 'yp-1', name: 'Downward-Facing Dog', sanskritName: 'Adho Mukha Svanasana', durationSeconds: 120, youtubeVideoId: 'j97SSGsnCAQ', startTimestampSec: 15, description: 'Ground palms, pedal feet for hamstring extensibility.' },
      { id: 'yp-2', name: 'Child Pose Savasana (Diaphragmatic Breath)', sanskritName: 'Balasana', durationSeconds: 300, youtubeVideoId: '2MJGg-dUKh0', startTimestampSec: 5, description: 'Deep diaphragmatic breathing to trigger parasympathetic dominance.' },
    ]
  }
];

const getPastDateISO = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const DEFAULT_LOGS: WorkoutLog[] = [
  {
    id: 'log-demo-knee',
    routineId: 'rot-mon-knee',
    routineName: 'Monday: Lower Body Strength & Knee Remediation',
    modality: 'strength',
    date: getPastDateISO(1),
    durationMinutes: 42,
    totalVolumeKg: 4850,
    totalSetsCompleted: 7,
    notes: 'Knee analgesia wall sit worked magic! Zero patellar tendon pain on squats.',
    aiReview: '⚡ Excellent execution. VMO activation optimal. Slow eccentric controlled.',
    syncedToSheets: true,
    exercises: []
  }
];

export const DEFAULT_AI_SKILLS: AISkill[] = [
  {
    id: 'skill-generative-intent',
    name: 'Generative UI Intent Parser',
    tagline: 'Parses natural language requests into dynamic Strength, Yoga, or Cardio interactive interfaces.',
    category: 'Routine Generator',
    systemPrompt: `You are Gemini 1.5 Flash acting as an adaptive fitness orchestrator. Output structured JSON schemas mapping to Strength, Yoga, or Cardio components.`,
    userPromptTemplate: `Parse intent for: {{userPrompt}}`,
    isAutoTriggerEnabled: true,
    lastExecutedAt: getPastDateISO(1)
  }
];

export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1ExampleWorkoutDatabaseSheet/edit',
  webhookUrl: '',
  autoSync: true,
  lastSyncedAt: new Date().toISOString(),
  syncStatus: 'idle',
};

// Storage API
export const StorageService = {
  getExercises(): Exercise[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      return DEFAULT_EXERCISES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_EXERCISES;
    }
  },

  saveExercises(exercises: Exercise[]): void {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  addExercise(exercise: Exercise): void {
    const list = this.getExercises();
    list.unshift(exercise);
    this.saveExercises(list);
  },

  getRoutines(): Routine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
      return DEFAULT_ROUTINES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ROUTINES;
    }
  },

  saveRoutines(routines: Routine[]): void {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  },

  addRoutine(routine: Routine): void {
    const list = this.getRoutines();
    list.unshift(routine);
    this.saveRoutines(list);
  },

  getWorkoutLogs(): WorkoutLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_LOGS;
    }
  },

  saveWorkoutLogs(logs: WorkoutLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  addWorkoutLog(log: WorkoutLog): void {
    const logs = this.getWorkoutLogs();
    logs.unshift(log);
    this.saveWorkoutLogs(logs);
  },

  getAISkills(): AISkill[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(DEFAULT_AI_SKILLS));
      return DEFAULT_AI_SKILLS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_AI_SKILLS;
    }
  },

  saveAISkills(skills: AISkill[]): void {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  updateAISkill(updatedSkill: AISkill): void {
    const skills = this.getAISkills().map(s => s.id === updatedSkill.id ? updatedSkill : s);
    this.saveAISkills(skills);
  },

  getSheetsConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(DEFAULT_SHEETS_CONFIG));
      return DEFAULT_SHEETS_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SHEETS_CONFIG;
    }
  },

  saveSheetsConfig(config: GoogleSheetsConfig): void {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
  }
};
