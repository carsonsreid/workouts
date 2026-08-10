import { WorkoutLog, Routine, Exercise, GoogleSheetsConfig } from '../types';
import { GoogleSheetsSyncService } from './googleSheetsSync';

export interface UserBiometrics {
  age: number;
  weightLbs: number;
  heightInches: number;
  vo2MaxBaseline: number;
  jointLimitations: string[];
  equipmentAvailable: string[];
}

export interface MuscleRecoveryState {
  chest: number; // 0 to 100% fresh
  back: number;
  legs: number;
  shoulders: number;
  core: number;
  arms: number;
}

const STORAGE_KEYS = {
  LOGS: 'pulse_genui_logs_v1',
  USER_STATE: 'pulse_genui_user_state_v1',
  SHEETS_CONFIG: 'pulse_genui_sheets_v1',
};

export const DatabaseService = {
  getUserBiometrics(): UserBiometrics {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATE);
    if (raw) {
      try { return JSON.parse(raw); } catch { }
    }
    return {
      age: 35,
      weightLbs: 190,
      heightInches: 74,
      vo2MaxBaseline: 48.5,
      jointLimitations: ['patellar tendinopathy in right knee', 'subacromial shoulder tightness'],
      equipmentAvailable: ['squat rack', 'barbell', 'landmine', 'dumbbells', 'row machine', 'gymnastic rings'],
    };
  },

  saveUserBiometrics(biometrics: UserBiometrics): void {
    localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(biometrics));
  },

  getWorkoutLogs(): WorkoutLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      try { return JSON.parse(raw); } catch { }
    }
    return [
      {
        id: 'log-mon-knee',
        routineId: 'rot-mon-knee',
        routineName: 'Monday: Lower Body Strength & Knee Remediation',
        modality: 'strength',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        durationMinutes: 42,
        totalVolumeKg: 4850,
        totalSetsCompleted: 7,
        notes: '45s isometric wall sit eliminated knee discomfort on squats!',
        aiReview: '⚡ VMO activation high. Tendon loading optimal. Progressive overload: +1kg next session.',
        syncedToSheets: true,
        exercises: [
          {
            exerciseId: 'ex-squat',
            exerciseName: 'Barbell Back Squat (HSR 3s Eccentric)',
            muscleGroup: 'Legs',
            sets: [
              { id: 's1', setNumber: 1, reps: 6, weightKg: 95, completed: true, rpe: 8 },
              { id: 's2', setNumber: 2, reps: 6, weightKg: 95, completed: true, rpe: 8 },
            ]
          }
        ]
      },
      {
        id: 'log-wed-upper',
        routineId: 'rot-wed-upper',
        routineName: 'Wednesday: Upper Body Hypertrophy & Posture',
        modality: 'strength',
        date: new Date(Date.now() - 86400000).toISOString(),
        durationMinutes: 45,
        totalVolumeKg: 5200,
        totalSetsCompleted: 8,
        notes: 'Ring pull-ups felt silky smooth on wrists.',
        aiReview: '🧘 Lat activation 94%. Scapular retraction flawless. Face pull goalpost form verified.',
        syncedToSheets: true,
        exercises: []
      }
    ];
  },

  saveWorkoutLog(log: WorkoutLog, sheetsConfig?: GoogleSheetsConfig): void {
    const logs = this.getWorkoutLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

    // Optional 2-way sync to Google Sheets
    if (sheetsConfig && sheetsConfig.webhookUrl) {
      GoogleSheetsSyncService.syncWorkoutLogToSheets(log, sheetsConfig);
    }
  },

  getMuscleRecoveryState(): MuscleRecoveryState {
    const logs = this.getWorkoutLogs();
    const now = Date.now();
    let chestFatigue = 0;
    let legsFatigue = 0;
    let backFatigue = 0;

    logs.forEach(log => {
      const ageHours = (now - new Date(log.date).getTime()) / 3600000;
      if (ageHours < 72) {
        const decay = Math.max(0, 1 - ageHours / 72);
        if (log.modality === 'strength') {
          if (log.routineName.toLowerCase().includes('lower') || log.routineName.toLowerCase().includes('knee')) {
            legsFatigue += 60 * decay;
          }
          if (log.routineName.toLowerCase().includes('upper') || log.routineName.toLowerCase().includes('push')) {
            chestFatigue += 50 * decay;
            backFatigue += 40 * decay;
          }
        }
      }
    });

    return {
      chest: Math.max(10, Math.round(100 - chestFatigue)),
      back: Math.max(10, Math.round(100 - backFatigue)),
      legs: Math.max(10, Math.round(100 - legsFatigue)),
      shoulders: 85,
      core: 90,
      arms: 80,
    };
  }
};
