import React from 'react';
import { DatabaseService } from '../services/db';
import { IconFlame, IconSparkles } from './Icons';

export const MuscleRecoveryWidget: React.FC = () => {
  const recovery = DatabaseService.getMuscleRecoveryState();

  const muscles = [
    { name: 'Chest', pct: recovery.chest },
    { name: 'Back', pct: recovery.back },
    { name: 'Legs (Quadriceps & Hamstrings)', pct: recovery.legs },
    { name: 'Shoulders & Rotator Cuff', pct: recovery.shoulders },
    { name: 'Core & Abdominals', pct: recovery.core },
    { name: 'Arms (Biceps & Triceps)', pct: recovery.arms },
  ];

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="metric-pill" style={{ color: 'var(--apple-green)', background: 'rgba(52, 199, 89, 0.1)' }}>
              FITBOD & SENSAI RECOVERY RADAR
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
            Muscle Group Freshness & Fatigue Heatmap
          </h3>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          Updated Real-Time from Database
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {muscles.map((m) => {
          const isFresh = m.pct >= 70;
          const isFatigued = m.pct < 50;

          return (
            <div
              key={m.name}
              style={{
                background: 'rgba(245, 247, 250, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{m.name}</span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: isFresh ? 'var(--apple-green)' : isFatigued ? 'var(--apple-red)' : 'var(--apple-blue)',
                  }}
                >
                  {m.pct}% Fresh
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${m.pct}%`,
                    height: '100%',
                    background: isFresh
                      ? 'var(--apple-green)'
                      : isFatigued
                      ? 'var(--apple-red)'
                      : 'var(--apple-blue)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
