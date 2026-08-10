import React, { useState, useEffect } from 'react';
import { Routine, Exercise, WorkoutLog, GoogleSheetsConfig } from './types';
import { StorageService } from './services/storage';
import { SupabaseService } from './services/supabase';
import { Dashboard } from './components/Dashboard';

export function App() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    sheetUrl: '',
    webhookUrl: '',
    autoSync: true,
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'idle',
  });

  useEffect(() => {
    setAllExercises(StorageService.getExercises());
    setRoutines(StorageService.getRoutines());
    setSheetsConfig(StorageService.getSheetsConfig());

    // Load initial logs from local storage first
    const localLogs = StorageService.getWorkoutLogs();
    setLogs(localLogs);

    // Asynchronously fetch fresh logs directly from Supabase PostgreSQL
    if (SupabaseService.isConfigured()) {
      SupabaseService.fetchWorkoutHistory().then(cloudLogs => {
        if (cloudLogs && cloudLogs.length > 0) {
          // Merge cloud logs with local logs
          const mergedMap = new Map<string, WorkoutLog>();
          [...localLogs, ...cloudLogs].forEach(log => {
            mergedMap.set(log.id, log);
          });
          setLogs(Array.from(mergedMap.values()));
        }
      });
    }
  }, []);

  const handleFinishWorkout = (newLog: WorkoutLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--everfit-bg)', padding: '24px 16px' }}>
      <Dashboard
        routines={routines}
        allExercises={allExercises}
        logs={logs}
        sheetsConfig={sheetsConfig}
        onFinishWorkout={handleFinishWorkout}
      />
    </div>
  );
}

export default App;
