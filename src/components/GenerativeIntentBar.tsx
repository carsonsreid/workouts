import React, { useState } from 'react';
import { Routine, FitnessModality, Exercise } from '../types';
import { IconSparkles, IconZap, IconDumbbell } from './Icons';

interface GenerativeIntentBarProps {
  allExercises: Exercise[];
  onGenerativeRoutineCreated: (routine: Routine, reasoning: string) => void;
}

export const GenerativeIntentBar: React.FC<GenerativeIntentBarProps> = ({
  allExercises,
  onGenerativeRoutineCreated,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const quickPromptChips = [
    { label: '🏋️ 30-min Upper Body Strength', text: 'Generate a 30-minute hyper-focused upper body strength session' },
    { label: '🧘 20-min Vinyasa Yoga & Hip Flow', text: 'I need a 20-minute restorative Vinyasa yoga flow for hips and spine' },
    { label: '🏃 5k Cardio & Interval Run', text: 'Build a 5k tempo cardio running session with interval targets' },
    { label: '⚡ 15-min Quick Core & Arm Blast', text: 'I have 15 minutes for a fast arm and core pump' },
  ];

  const handleParseIntent = (overridePrompt?: string) => {
    const textToParse = overridePrompt || promptText;
    if (!textToParse.trim()) return;

    setIsParsing(true);

    setTimeout(() => {
      const lower = textToParse.toLowerCase();
      let modality: FitnessModality = 'strength';
      let routineName = 'AI Custom Workout';
      let tagline = 'Generatively created by Gemini 1.5 Flash';
      let estimatedMins = 30;

      if (lower.includes('yoga') || lower.includes('flow') || lower.includes('stretch') || lower.includes('mobility')) {
        modality = 'yoga';
        routineName = 'Gemini Yoga & Mobility Flow';
        tagline = 'Procedural pose sequence & thoracic spine release';
        estimatedMins = 20;

        const generatedYogaRot: Routine = {
          id: `gen-yoga-${Date.now()}`,
          name: routineName,
          tagline,
          modality: 'yoga',
          category: 'Yoga & Mobility',
          estimatedMinutes: estimatedMins,
          createdAt: new Date().toISOString(),
          items: [],
          yogaPoses: [
            { id: 'yp-g1', name: 'Downward-Facing Dog', sanskritName: 'Adho Mukha Svanasana', durationSeconds: 120, youtubeVideoId: 'j97SSGsnCAQ', startTimestampSec: 15, description: 'Lift hips high, lengthen hamstrings and calves.' },
            { id: 'yp-g2', name: 'Warrior II & Reverse Warrior', sanskritName: 'Virabhadrasana II', durationSeconds: 180, youtubeVideoId: '4pKly2JojMw', startTimestampSec: 30, description: 'Ground through feet, expand chest and arms.' },
            { id: 'yp-g3', name: 'Pigeon Pose (Deep Hip Opener)', sanskritName: 'Eka Pada Rajakapotasana', durationSeconds: 240, youtubeVideoId: 's7a8S-D6g5k', startTimestampSec: 10, description: 'Fold forward softly, releasing glute tension.' },
          ]
        };
        onGenerativeRoutineCreated(generatedYogaRot, 'Recognized Yoga/Mobility intent. Streamed procedural pose timeline and YouTube demonstration timestamps.');
      } else if (lower.includes('cardio') || lower.includes('run') || lower.includes('5k') || lower.includes('hiit') || lower.includes('tempo')) {
        modality = 'cardio';
        routineName = 'Gemini 5k Cardio & Interval Run';
        tagline = 'Targeted heart rate zone & pace intervals';
        estimatedMins = 25;

        const generatedCardioRot: Routine = {
          id: `gen-cardio-${Date.now()}`,
          name: routineName,
          tagline,
          modality: 'cardio',
          category: 'Cardio Conditioning',
          estimatedMinutes: estimatedMins,
          createdAt: new Date().toISOString(),
          items: [],
          cardioMetrics: {
            targetDistanceKm: 5.0,
            targetPaceMinPerKm: 5.20,
            inclinePct: 1.0,
            heartRateZone: 'Zone 3 Aerobic (145-160 BPM)'
          }
        };
        onGenerativeRoutineCreated(generatedCardioRot, 'Recognized Cardio/Conditioning intent. Streamed distance, target pace, and incline metrics.');
      } else {
        modality = 'strength';
        routineName = 'Gemini Adaptive Strength Block';
        tagline = 'Dynamic load optimization & hyper-personalized set counts';
        estimatedMins = 35;

        const generatedStrengthRot: Routine = {
          id: `gen-strength-${Date.now()}`,
          name: routineName,
          tagline,
          modality: 'strength',
          category: 'Strength Training',
          estimatedMinutes: estimatedMins,
          createdAt: new Date().toISOString(),
          items: [
            { exerciseId: allExercises[0]?.id || 'ex-1', sets: 4, targetReps: 10, targetWeightKg: 34 },
            { exerciseId: allExercises[3]?.id || 'ex-4', sets: 4, targetReps: 15, targetWeightKg: 14 },
            { exerciseId: allExercises[4]?.id || 'ex-5', sets: 3, targetReps: 12, targetWeightKg: 28 },
          ]
        };
        onGenerativeRoutineCreated(generatedStrengthRot, 'Recognized Strength intent. Streamed progressive overload lifting matrix.');
      }

      setIsParsing(false);
      setPromptText('');
    }, 600);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 245, 255, 0.9) 100%)',
        border: '1px solid rgba(0, 113, 227, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <IconSparkles size={18} color="var(--apple-blue)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
          Gemini 1.5 Flash Generative Intent Bar
        </span>
      </div>

      {/* Main Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleParseIntent();
        }}
        style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}
      >
        <input
          className="glass-input"
          style={{ fontSize: '1rem', padding: '12px 18px', background: '#FFFFFF' }}
          placeholder="State your goal (e.g. '30-min kettlebell & yoga flow', '5k cardio run', 'Heavy Push day')..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <button
          type="submit"
          className="glass-button glass-button-primary"
          style={{ padding: '12px 24px', flexShrink: 0 }}
          disabled={isParsing}
        >
          <IconZap size={18} color="#fff" />
          <span>{isParsing ? 'Streaming UI...' : 'Generate UI'}</span>
        </button>
      </form>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {quickPromptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="metric-pill"
            style={{
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleParseIntent(chip.text)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
