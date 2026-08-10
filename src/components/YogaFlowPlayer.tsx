import React, { useState, useEffect } from 'react';
import { Routine, YogaPose, WorkoutLog, GoogleSheetsConfig } from '../types';
import { IconCheck, IconTimer, IconPlay, IconSparkles } from './Icons';
import { GoogleSheetsSyncService } from '../services/googleSheetsSync';

interface YogaFlowPlayerProps {
  routine: Routine;
  sheetsConfig: GoogleSheetsConfig;
  onFinishYogaSession: (log: WorkoutLog) => void;
}

export const YogaFlowPlayer: React.FC<YogaFlowPlayerProps> = ({
  routine,
  sheetsConfig,
  onFinishYogaSession,
}) => {
  const poses: YogaPose[] = routine.yogaPoses || [];
  const [activePoseIdx, setActivePoseIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [poseTimerSec, setPoseTimerSec] = useState(poses[0]?.durationSeconds || 120);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const activePose = poses[activePoseIdx] || poses[0] || {
    id: 'yp-default',
    name: 'Restorative Stretch',
    durationSeconds: 180,
    youtubeVideoId: 'j97SSGsnCAQ',
    startTimestampSec: 15,
    description: 'Deep breathing & hip mobility flow',
  };

  // Session timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setPoseTimerSec((prev) => {
        if (prev <= 1) {
          // Auto advance to next pose if available
          if (activePoseIdx < poses.length - 1) {
            setActivePoseIdx((idx) => idx + 1);
            return poses[activePoseIdx + 1]?.durationSeconds || 120;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, activePoseIdx, poses]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectPose = (idx: number) => {
    setActivePoseIdx(idx);
    setPoseTimerSec(poses[idx]?.durationSeconds || 120);
    setIsPlaying(true);
  };

  const handleFinish = async () => {
    setIsSyncing(true);
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const newLog: WorkoutLog = {
      id: `log-yoga-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      modality: 'yoga',
      date: new Date().toISOString(),
      durationMinutes: durationMins,
      totalVolumeKg: 0,
      totalSetsCompleted: poses.length,
      exercises: [],
      notes: `Completed ${routine.name} (${poses.length} poses flow)`,
      aiReview: `🧘 Restorative flow completed! Active mobility time: ${durationMins} minutes. Hips and thoracic spine fully released.`,
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
    onFinishYogaSession(newLog);
  };

  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="metric-pill" style={{ color: 'var(--apple-purple)', borderColor: 'rgba(175, 82, 222, 0.3)', background: 'rgba(175, 82, 222, 0.08)' }}>
            YOGA & MOBILITY FLOW
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>
            {routine.name}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{routine.tagline}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="timer-ring-box" style={{ borderColor: 'rgba(175, 82, 222, 0.3)', color: 'var(--apple-purple)', background: 'rgba(175, 82, 222, 0.08)' }}>
            <IconTimer size={18} color="var(--apple-purple)" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            className="glass-button"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <IconPlay size={16} />
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: YouTube Video Embed + Active Pose Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '28px' }}>
        {/* YouTube Video Player Embed */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${activePose.youtubeVideoId}?autoplay=1&start=${activePose.startTimestampSec}&controls=1`}
            title={activePose.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Active Pose Info & Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.8)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--apple-purple)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Current Pose ({activePoseIdx + 1}/{poses.length})
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '2px' }}>{activePose.name}</h3>
            {activePose.sanskritName && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: '12px' }}>
                {activePose.sanskritName}
              </div>
            )}

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>
              {activePose.description}
            </p>

            <div style={{ background: 'rgba(175, 82, 222, 0.1)', border: '1px solid rgba(175, 82, 222, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pose Timer</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--apple-purple)' }}>
                {formatTime(poseTimerSec)}
              </div>
            </div>
          </div>

          <button
            className="glass-button glass-button-accent"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={isSyncing}
            onClick={handleFinish}
          >
            <IconCheck size={18} color="#fff" />
            <span>{isSyncing ? 'Syncing...' : 'Complete Yoga Flow'}</span>
          </button>
        </div>
      </div>

      {/* Pose Sequence Timeline Navigation */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Pose Sequence Timeline</h4>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${poses.length}, 1fr)`, gap: '10px' }}>
          {poses.map((pose, idx) => {
            const isSelected = idx === activePoseIdx;
            return (
              <div
                key={pose.id}
                onClick={() => handleSelectPose(idx)}
                style={{
                  background: isSelected ? 'rgba(175, 82, 222, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                  border: isSelected ? '1px solid var(--apple-purple)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? 'var(--apple-purple)' : 'var(--text-tertiary)' }}>
                  #{idx + 1} • {pose.durationSeconds}s
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{pose.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
