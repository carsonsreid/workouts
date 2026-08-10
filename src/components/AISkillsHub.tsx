import React, { useState } from 'react';
import { IconSparkles, IconDumbbell, IconFlame, IconCheck } from './Icons';

export const AISkillsHub: React.FC = () => {
  const [activeSkill, setActiveSkill] = useState<'nippard' | 'cavaliere' | 'huberman'>('nippard');

  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '28px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="metric-pill" style={{ color: 'var(--apple-blue)', background: 'rgba(0, 113, 227, 0.08)' }}>
              GEMINI SPARK AGENT SKILLS
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              SKILL.md Architecture
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Hybrid Coach AI Skills Hub
          </h2>
        </div>

        {/* Skill Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`variation-tab-btn ${activeSkill === 'nippard' ? 'active' : ''}`}
            onClick={() => setActiveSkill('nippard')}
          >
            💪 Nippard Hypertrophy
          </button>
          <button
            className={`variation-tab-btn ${activeSkill === 'cavaliere' ? 'active' : ''}`}
            onClick={() => setActiveSkill('cavaliere')}
          >
            🦴 Cavaliere Biomechanics
          </button>
          <button
            className={`variation-tab-btn ${activeSkill === 'huberman' ? 'active' : ''}`}
            onClick={() => setActiveSkill('huberman')}
          >
            🧠 Huberman Physiology
          </button>
        </div>
      </div>

      {/* SKILL 1: NIPPARD HYPERTROPHY & PROGRAMMING MODULE */}
      {activeSkill === 'nippard' && (
        <div style={{ background: 'rgba(245, 247, 250, 0.9)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <IconDumbbell size={22} color="var(--apple-blue)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Core Skill 1: Hypertrophy & Progressive Overload (Nippard Module)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-blue)', marginBottom: '4px' }}>1. Lengthened Partials</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                prescribes 3-6 partial reps at maximal stretch position (preacher curls, Romanian deadlifts, chest rows).
              </p>
            </div>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-blue)', marginBottom: '4px' }}>2. Rep Cadence & RIR</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Controlled 2-4s eccentric phase, explosive concentric, target 1-3 RIR (RPE 8-9) for maximal hypertrophic stimulus.
              </p>
            </div>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-blue)', marginBottom: '4px' }}>3. Volume Allocation</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                10-20 weekly sets per muscle group, or minimalist 6 sets/week high-intensity maintenance protocol.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SKILL 2: CAVALIERE BIOMECHANICS & JOINT INTEGRITY MODULE */}
      {activeSkill === 'cavaliere' && (
        <div style={{ background: 'rgba(245, 247, 250, 0.9)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <IconSparkles size={22} color="var(--apple-purple)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Core Skill 2: Biomechanics & Joint Integrity (Cavaliere Module)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-purple)', marginBottom: '4px' }}>1. Core Bulletproofing</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Pallof Press for transverse abdominis anti-rotation; Dead Bugs for anti-extension & lumbar protection.
              </p>
            </div>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-purple)', marginBottom: '4px' }}>2. Shoulder Protection</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                High-to-low Face Pulls with underhand thumbs-back grip ("beat the hands backward") to clear rotator cuff space.
              </p>
            </div>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-purple)', marginBottom: '4px' }}>3. Tendon Analgesia</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                5 × 45s heavy isometric holds (70% MVC) to release intracortical inhibition and produce immediate knee tendon analgesia.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SKILL 3: HUBERMAN PHYSIOLOGY & RECOVERY MODULE */}
      {activeSkill === 'huberman' && (
        <div style={{ background: 'rgba(245, 247, 250, 0.9)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <IconFlame size={22} color="var(--apple-green)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Core Skill 3: Physiology, Recovery & Longevity (Huberman Module)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-green)', marginBottom: '4px' }}>1. VO2 Max & Zone 2</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                150-180 mins weekly Zone 2 aerobic base + Norwegian 4×4 HIIT for superior VO2 max longevity targets.
              </p>
            </div>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-green)', marginBottom: '4px' }}>2. Cold & Sauna Timing</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                11 min/week cold exposure (never within 4-6h post-lift); 57 min/week sauna at 80-100°C for heat shock proteins.
              </p>
            </div>
            <div style={{ background: '#FFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--apple-green)', marginBottom: '4px' }}>3. NSDR & Circadian</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                10-20 mins Non-Sleep Deep Rest (Yoga Nidra) for acute parasympathetic recovery and dopamine baseline restoration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
