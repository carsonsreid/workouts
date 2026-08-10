import React, { useState } from 'react';
import { WorkoutLog, Routine } from '../types';
import { IconCheck, IconPlus, IconDumbbell } from './Icons';

interface CalendarScheduleProps {
  logs: WorkoutLog[];
  routines: Routine[];
  onSelectDate: (dateStr: string) => void;
  onSelectRoutine: (routine: Routine) => void;
}

export const CalendarSchedule: React.FC<CalendarScheduleProps> = ({
  logs,
  routines,
  onSelectDate,
  onSelectRoutine,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(new Date().toISOString().slice(0, 10));
  const [monthOffset, setMonthOffset] = useState(0);

  const getMonthDays = () => {
    const now = new Date();
    now.setMonth(now.getMonth() + monthOffset);
    const year = now.getFullYear();
    const month = now.getMonth();

    const lastDay = new Date(year, month + 1, 0);
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const totalDays = lastDay.getDate();

    const daysArr = [];
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const isoDate = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const logForDay = logs.find((l) => l.date.slice(0, 10) === isoDate);
      const isToday = isoDate === new Date().toISOString().slice(0, 10);

      daysArr.push({
        dayNum,
        isoDate,
        dayName,
        isToday,
        logForDay,
      });
    }

    return { monthName, daysArr };
  };

  const { monthName, daysArr } = getMonthDays();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3;
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const isoDate = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const logForDay = logs.find((l) => l.date.slice(0, 10) === isoDate);
    const isToday = offset === 0;

    return {
      offset,
      isoDate,
      dayName,
      dayNum,
      isToday,
      logForDay,
    };
  });

  const handleDayClick = (isoDate: string) => {
    if (selectedIsoDate === isoDate) {
      setSelectedIsoDate(null); // Collapse if clicked again
    } else {
      setSelectedIsoDate(isoDate);
      onSelectDate(isoDate);
    }
  };

  const selectedLog = selectedIsoDate ? logs.find((l) => l.date.slice(0, 10) === selectedIsoDate) : null;
  const selectedDateFormatted = selectedIsoDate
    ? new Date(selectedIsoDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', background: '#FFFFFF' }}>
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="metric-pill" style={{ color: 'var(--apple-blue)', background: 'rgba(0, 113, 227, 0.08)' }}>
              INLINE EXPANDABLE CALENDAR
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {monthName}
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
            Workout Schedule & History Planner
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {viewMode === 'month' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="glass-button"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setMonthOffset((m) => m - 1)}
              >
                ← Prev Month
              </button>
              <button
                className="glass-button"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setMonthOffset(0)}
              >
                Today
              </button>
              <button
                className="glass-button"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setMonthOffset((m) => m + 1)}
              >
                Next Month →
              </button>
            </div>
          )}

          <div className="nav-pills" style={{ padding: '3px' }}>
            <button
              className={`nav-pill-item ${viewMode === 'week' ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewMode('week')}
            >
              7-Day Strip
            </button>
            <button
              className={`nav-pill-item ${viewMode === 'month' ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewMode('month')}
            >
              30-Day Grid
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: 7-DAY WEEK STRIP */}
      {viewMode === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: selectedIsoDate ? '16px' : '0' }}>
          {weekDays.map((day) => {
            const isSelected = day.isoDate === selectedIsoDate;
            return (
              <div
                key={day.isoDate}
                onClick={() => handleDayClick(day.isoDate)}
                style={{
                  background: isSelected
                    ? 'var(--apple-blue)'
                    : day.isToday
                    ? 'rgba(0, 113, 227, 0.12)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: isSelected ? '#FFFFFF' : day.isToday ? 'var(--apple-blue)' : 'var(--text-primary)',
                  border: isSelected
                    ? '1px solid var(--apple-blue)'
                    : day.isToday
                    ? '1px solid rgba(0, 113, 227, 0.3)'
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: isSelected ? 0.9 : 0.7 }}>
                  {day.dayName}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: '2px 0' }}>
                  {day.dayNum}
                </div>

                <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                  {day.logForDay ? (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: isSelected ? '#FFFFFF' : 'var(--apple-green)',
                        color: isSelected ? 'var(--apple-blue)' : '#FFFFFF',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      ✓ {day.logForDay.totalVolumeKg > 0 ? `${Math.round(day.logForDay.totalVolumeKg / 1000)}k kg` : 'DONE'}
                    </span>
                  ) : day.isToday ? (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.8 }}>TODAY</span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', opacity: 0.4 }}>REST</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: 30-DAY MONTHLY GRID */}
      {viewMode === 'month' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: selectedIsoDate ? '16px' : '0' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', paddingBottom: '4px' }}>
              {d}
            </div>
          ))}

          {daysArr.map((day) => {
            const isSelected = day.isoDate === selectedIsoDate;
            const log = day.logForDay;

            return (
              <div
                key={day.isoDate}
                onClick={() => handleDayClick(day.isoDate)}
                style={{
                  background: isSelected
                    ? 'var(--apple-blue)'
                    : log
                    ? log.modality === 'yoga'
                      ? 'rgba(175, 82, 222, 0.12)'
                      : log.modality === 'cardio'
                      ? 'rgba(52, 199, 89, 0.12)'
                      : 'rgba(0, 113, 227, 0.12)'
                    : day.isToday
                    ? 'rgba(0, 113, 227, 0.08)'
                    : 'rgba(0, 0, 0, 0.02)',
                  color: isSelected ? '#FFFFFF' : day.isToday ? 'var(--apple-blue)' : 'var(--text-primary)',
                  border: isSelected
                    ? '1px solid var(--apple-blue)'
                    : day.isToday
                    ? '1px solid var(--apple-blue)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 4px',
                  minHeight: '54px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{day.dayNum}</span>
                {log && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: isSelected ? '#FFFFFF' : log.modality === 'yoga' ? 'var(--apple-purple)' : log.modality === 'cardio' ? 'var(--apple-green)' : 'var(--apple-blue)',
                    }}
                  >
                    ✓ {log.routineName.split(' ')[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* INLINE SMOOTH EXPANDABLE ACCORDION DRAWER */}
      {selectedIsoDate && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(235, 242, 255, 0.95) 100%)',
            border: '1px solid rgba(0, 113, 227, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            animation: 'pulseGlow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="metric-pill" style={{ color: 'var(--apple-blue)', background: 'rgba(0, 113, 227, 0.1)' }}>
                INLINE DAY EXPANDER
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedDateFormatted}</h4>
            </div>

            <button
              onClick={() => setSelectedIsoDate(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}
            >
              Close Expander ✕
            </button>
          </div>

          {selectedLog ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 113, 227, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconDumbbell size={20} color="var(--apple-blue)" />
                </div>
                <div>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedLog.routineName}</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                    Duration: {selectedLog.durationMinutes} mins • Volume: {selectedLog.totalVolumeKg.toLocaleString()} kg • {selectedLog.totalSetsCompleted} sets logged
                  </p>
                </div>
              </div>

              {selectedLog.aiReview && (
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', background: '#FFFFFF', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  {selectedLog.aiReview}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                No workout recorded for this date. Would you like to schedule or log a session?
              </p>
              <button
                className="glass-button glass-button-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => onSelectRoutine(routines[0])}
              >
                <IconPlus size={14} color="#fff" /> Log Session for This Date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
