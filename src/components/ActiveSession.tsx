import React, { useState, useEffect } from 'react';
import { Routine, WorkoutLog, ActiveWorkoutExercise, Exercise, GoogleSheetsConfig } from '../types';
import { IconTimer, IconCheck, IconPlus, IconSparkles } from './Icons';
import { GoogleSheetsSyncService } from '../services/googleSheetsSync';

interface ActiveSessionProps {
  routine: Routine;
  allExercises: Exercise[];
  sheetsConfig: GoogleSheetsConfig;
  onFinishSession: (log: WorkoutLog) => void;
  onCancel: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  routine,
  allExercises,
  sheetsConfig,
  onFinishSession,
  onCancel,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const [activeExercises, setActiveExercises] = useState<ActiveWorkoutExercise[]>(() => {
    return routine.items.map((item) => {
      const match = allExercises.find((e) => e.id === item.exerciseId);
      const exerciseName = match ? match.name : 'Custom Exercise';
      const muscleGroup = match ? match.muscleGroup : 'Full Body';

      const initialSets = Array.from({ length: item.sets }, (_, idx) => ({
        id: `set-${item.exerciseId}-${idx + 1}`,
        setNumber: idx + 1,
        reps: item.targetReps,
        weightKg: item.targetWeightKg,
        completed: false,
        rpe: 8,
      }));

      return {
        exerciseId: item.exerciseId,
        exerciseName,
        muscleGroup,
        sets: initialSets,
      };
    });
  });

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restTimerSeconds === null) return;
    if (restTimerSeconds <= 0) {
      setRestTimerSeconds(null);
      return;
    }
    const timer = setInterval(() => {
      setRestTimerSeconds((prev) => (prev ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [restTimerSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = [...activeExercises];
    const targetSet = updated[exIdx].sets[setIdx];
    targetSet.completed = !targetSet.completed;
    setActiveExercises(updated);
    if (targetSet.completed) {
      setRestTimerSeconds(90);
    }
  };

  const updateSetMetric = (exIdx: number, setIdx: number, field: 'reps' | 'weightKg' | 'rpe', val: number) => {
    const updated = [...activeExercises];
    updated[exIdx].sets[setIdx][field] = val;
    setActiveExercises(updated);
  };

  const addSetToExercise = (exIdx: number) => {
    const updated = [...activeExercises];
    const currentSets = updated[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1];

    currentSets.push({
      id: `set-${updated[exIdx].exerciseId}-${currentSets.length + 1}`,
      setNumber: currentSets.length + 1,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 20,
      completed: false,
      rpe: 8,
    });
    setActiveExercises(updated);
  };

  const handleFinish = async () => {
    setIsSyncing(true);

    let totalVolume = 0;
    let completedSetsCount = 0;

    activeExercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVolume += set.reps * set.weightKg;
          completedSetsCount += 1;
        }
      });
    });

    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      modality: 'strength',
      date: new Date().toISOString(),
      durationMinutes: durationMins,
      totalVolumeKg: totalVolume,
      totalSetsCompleted: completedSetsCount,
      exercises: activeExercises,
      notes: sessionNotes,
      aiReview: `⚡ Clean effort on ${routine.name}! Completed ${completedSetsCount} sets (${totalVolume.toLocaleString()} kg volume) in ${durationMins} mins. Progressive overload suggested: +1kg next session.`,
      syncedToSheets: false,
    };

    if (sheetsConfig.webhookUrl) {
      setSyncStatusMsg('Syncing to Google Sheets...');
      const syncResult = await GoogleSheetsSyncService.syncWorkoutLogToSheets(newLog, sheetsConfig);
      if (syncResult.success) {
        newLog.syncedToSheets = true;
        setSyncStatusMsg('Synced to Google Sheets!');
      } else {
        setSyncStatusMsg(syncResult.message);
      }
    }

    setIsSyncing(false);
    onFinishSession(newLog);
  };

  return (
    <div className="active-session-overlay">
      <div className="glass-card active-session-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                {routine.name}
              </h2>
              <span className="metric-pill" style={{ color: 'var(--apple-green)', borderColor: 'rgba(48, 209, 88, 0.3)' }}>
                LIVE SESSION
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {routine.tagline}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="timer-ring-box">
              <IconTimer size={20} color="var(--apple-cyan)" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button className="glass-button" style={{ background: 'rgba(255, 59, 48, 0.15)', color: 'var(--apple-red)' }} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>

        {restTimerSeconds !== null && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.18) 0%, rgba(191, 90, 242, 0.18) 100%)',
              border: '1px solid rgba(10, 132, 255, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              animation: 'pulseGlow 2s infinite ease-in-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconSparkles size={20} color="var(--apple-cyan)" />
              <span style={{ fontWeight: 600 }}>Rest & Recovery Timer</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {formatTime(restTimerSeconds)}
            </div>
            <button className="glass-button" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setRestTimerSeconds(null)}>
              Skip Rest
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '28px' }}>
          {activeExercises.map((ex, exIdx) => (
            <div key={ex.exerciseId} className="glass-card" style={{ padding: '20px', background: 'rgba(15, 17, 26, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ex.exerciseName}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--apple-cyan)', fontWeight: 600 }}>{ex.muscleGroup}</span>
                </div>
                <button
                  className="glass-button"
                  style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                  onClick={() => addSetToExercise(exIdx)}
                >
                  <IconPlus size={14} /> Add Set
                </button>
              </div>

              <table className="sets-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>SET</th>
                    <th>WEIGHT (KG)</th>
                    <th>REPS</th>
                    <th>RPE (1-10)</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>DONE</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((set, setIdx) => (
                    <tr key={set.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>#{set.setNumber}</td>
                      <td>
                        <input
                          type="number"
                          className="glass-input"
                          style={{ padding: '6px 10px', width: '90px' }}
                          value={set.weightKg}
                          onChange={(e) => updateSetMetric(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="glass-input"
                          style={{ padding: '6px 10px', width: '80px' }}
                          value={set.reps}
                          onChange={(e) => updateSetMetric(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          className="glass-input"
                          style={{ padding: '6px 10px', width: '70px' }}
                          value={set.rpe || 8}
                          onChange={(e) => updateSetMetric(exIdx, setIdx, 'rpe', parseFloat(e.target.value) || 8)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`set-check-btn ${set.completed ? 'completed' : ''}`}
                          onClick={() => toggleSetComplete(exIdx, setIdx)}
                        >
                          <IconCheck size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Workout Session Notes:
          </label>
          <textarea
            className="glass-input"
            rows={3}
            placeholder="e.g. Heavy sets moved smoothly..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            {syncStatusMsg || (sheetsConfig.webhookUrl ? '✓ Ready to sync to Google Sheets' : 'Local storage active')}
          </div>

          <button
            className="glass-button glass-button-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
            disabled={isSyncing}
            onClick={handleFinish}
          >
            <IconCheck size={18} color="#fff" />
            <span>{isSyncing ? 'Syncing...' : 'Complete Workout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
