import React, { useState, useEffect } from 'react';
import { Routine, WorkoutLog, GoogleSheetsConfig } from '../types';
import { IconCheck, IconTimer } from './Icons';
import { GoogleSheetsSyncService } from '../services/googleSheetsSync';

interface CardioTrackerProps {
  routine: Routine;
  sheetsConfig: GoogleSheetsConfig;
  onFinishCardioSession: (log: WorkoutLog) => void;
}

export const CardioTracker: React.FC<CardioTrackerProps> = ({
  routine,
  sheetsConfig,
  onFinishCardioSession,
}) => {
  const metrics = routine.cardioMetrics || {
    targetDistanceKm: 5.0,
    targetPaceMinPerKm: 5.15,
    inclinePct: 1.0,
    heartRateZone: 'Zone 3 (145-160 BPM)',
  };

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedKm, setCompletedKm] = useState(metrics.targetDistanceKm);
  const [rpeRating, setRpeRating] = useState(7);
  const [cardioNotes, setCardioNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setIsSyncing(true);
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const newLog: WorkoutLog = {
      id: `log-cardio-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      modality: 'cardio',
      date: new Date().toISOString(),
      durationMinutes: durationMins,
      totalVolumeKg: 0,
      totalSetsCompleted: 1,
      distanceKm: completedKm,
      exercises: [],
      notes: cardioNotes || `Completed ${completedKm} km run @ RPE ${rpeRating}`,
      aiReview: `🏃 Cardio session complete! Covered ${completedKm} km in ${durationMins} mins. ${rpeRating >= 8 ? 'High exertion detected: Recommend a 15-minute Vinyasa yoga flow tomorrow for leg recovery.' : 'Aerobic pace maintained cleanly.'}`,
      syncedToSheets: false,
    };

    if (sheetsConfig.webhookUrl) {
      setSyncStatusMsg('Syncing to Google Sheets...');
      const res = await GoogleSheetsSyncService.syncWorkoutLogToSheets(newLog, sheetsConfig);
      if (res.success) {
        newLog.syncedToSheets = true;
        setSyncStatusMsg('✓ Synced to Google Sheets!');
      } else {
        setSyncStatusMsg(res.message);
      }
    } else {
      setSyncStatusMsg('✓ Saved to local database');
    }

    setIsSyncing(false);
    onFinishCardioSession(newLog);
  };

  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="metric-pill" style={{ color: 'var(--apple-green)', borderColor: 'rgba(52, 199, 89, 0.3)', background: 'rgba(52, 199, 89, 0.08)' }}>
            CARDIO & CONDITIONING
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>
            {routine.name}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{routine.tagline}</p>
        </div>

        <div className="timer-ring-box">
          <IconTimer size={18} color="var(--apple-blue)" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      <div className="dense-stat-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card dense-stat-box">
          <div className="dense-stat-label">Target Distance</div>
          <div className="dense-stat-val" style={{ color: 'var(--apple-green)' }}>
            {completedKm} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>km</span>
          </div>
        </div>

        <div className="glass-card dense-stat-box">
          <div className="dense-stat-label">Target Pace</div>
          <div className="dense-stat-val">
            {metrics.targetPaceMinPerKm} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>min/km</span>
          </div>
        </div>

        <div className="glass-card dense-stat-box">
          <div className="dense-stat-label">Incline Grade</div>
          <div className="dense-stat-val">
            {metrics.inclinePct}%
          </div>
        </div>

        <div className="glass-card dense-stat-box">
          <div className="dense-stat-label">Heart Rate Zone</div>
          <div className="dense-stat-val" style={{ fontSize: '1.1rem', color: 'var(--apple-blue)' }}>
            {metrics.heartRateZone}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Logged Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              className="glass-input"
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
              value={completedKm}
              onChange={(e) => setCompletedKm(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Perceived Exertion (RPE 1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="glass-input"
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
              value={rpeRating}
              onChange={(e) => setRpeRating(parseInt(e.target.value, 10) || 7)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Cardio Notes & Effort Feedback
          </label>
          <input
            className="glass-input"
            placeholder="e.g. Maintained 5:15 pace throughout. Felt strong in Zone 3..."
            value={cardioNotes}
            onChange={(e) => setCardioNotes(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          {syncStatusMsg || (sheetsConfig.webhookUrl ? '✓ Google Sheets Auto-Sync Armed' : 'Local Storage Active')}
        </div>

        <button
          className="glass-button glass-button-accent"
          style={{ padding: '12px 28px', fontSize: '1rem' }}
          disabled={isSyncing}
          onClick={handleFinish}
        >
          <IconCheck size={18} color="#fff" />
          <span>{isSyncing ? 'Syncing...' : 'Finish Cardio Session'}</span>
        </button>
      </div>
    </div>
  );
};
