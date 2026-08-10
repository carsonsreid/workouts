import React from 'react';
import { IconSparkles } from './Icons';

interface FloatingPiPVideoProps {
  youtubeVideoId: string;
  title: string;
  onClose: () => void;
}

export const FloatingPiPVideo: React.FC<FloatingPiPVideoProps> = ({ youtubeVideoId, title, onClose }) => {
  return (
    <div
      className="glass-card"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '320px',
        zIndex: 1000,
        padding: '12px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
        background: 'rgba(255, 255, 255, 0.94)',
        border: '1px solid var(--apple-blue)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--apple-blue)' }}>
          <IconSparkles size={14} color="var(--apple-blue)" />
          <span>PiP Form Guide</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}
        >
          ✕
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000' }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </div>
    </div>
  );
};
