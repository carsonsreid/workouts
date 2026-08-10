import React from 'react';
import { IconDumbbell } from './Icons';

interface NavbarProps {
  currentTab: 'dashboard' | 'skills' | 'routines' | 'sheets';
  onSelectTab: (tab: 'dashboard' | 'skills' | 'routines' | 'sheets') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header style={{ maxWidth: '720px', margin: '0 auto 28px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: 'var(--radius-pill)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onSelectTab('dashboard')}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--apple-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <IconDumbbell size={16} color="#FFFFFF" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>
            PULSE
          </span>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {todayStr}
        </div>
      </div>
    </header>
  );
};
