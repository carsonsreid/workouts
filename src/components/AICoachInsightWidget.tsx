import React from 'react';
import { AICoachService } from '../services/aiCoach';
import { DatabaseService } from '../services/db';
import { IconSparkles, IconCheck, IconFlame } from './Icons';

export const AICoachInsightWidget: React.FC = () => {
  const logs = DatabaseService.getWorkoutLogs();
  const insight = AICoachService.analyzeUserProgress(logs);

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="metric-pill" style={{ color: 'var(--apple-blue)', background: 'rgba(0, 113, 227, 0.1)' }}>
              GEMINI 1.5 FLASH REASONING
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
            {insight.title}
          </h3>
        </div>

        <span className="metric-pill" style={{ color: 'var(--apple-green)', background: 'rgba(52, 199, 89, 0.1)', fontWeight: 700 }}>
          ✓ Database Synced
        </span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
        {insight.summaryText}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(0, 113, 227, 0.05)', border: '1px solid rgba(0, 113, 227, 0.15)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
            Progressive Overload Trend
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '4px' }}>
            {insight.progressiveOverloadTrend}
          </div>
        </div>

        <div style={{ background: 'rgba(52, 199, 89, 0.05)', border: '1px solid rgba(52, 199, 89, 0.15)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--apple-green)', textTransform: 'uppercase' }}>
            Recommended Action
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '4px' }}>
            {insight.suggestedAction}
          </div>
        </div>
      </div>
    </div>
  );
};
