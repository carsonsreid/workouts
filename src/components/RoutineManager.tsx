import React, { useState } from 'react';
import { Routine, Exercise, MuscleGroup } from '../types';
import { IconPlus, IconPlay, IconCheck } from './Icons';

interface RoutineManagerProps {
  routines: Routine[];
  exercises: Exercise[];
  onStartRoutine: (routine: Routine) => void;
  onAddRoutine: (newRoutine: Routine) => void;
  onAddExercise: (newExercise: Exercise) => void;
}

export const RoutineManager: React.FC<RoutineManagerProps> = ({
  routines,
  exercises,
  onStartRoutine,
  onAddRoutine,
  onAddExercise,
}) => {
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);

  const [routineName, setRoutineName] = useState('');
  const [routineTagline, setRoutineTagline] = useState('');
  const [routineCategory, setRoutineCategory] = useState('Hypertrophy');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState('Dumbbell');
  const [exMuscle, setExMuscle] = useState<MuscleGroup>('Chest');
  const [exSets, setExSets] = useState(4);
  const [exReps, setExReps] = useState(10);
  const [exWeight, setExWeight] = useState(25);

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) return;

    const items = selectedExerciseIds.map((id) => {
      const match = exercises.find((ex) => ex.id === id);
      return {
        exerciseId: id,
        sets: match ? match.defaultSets : 4,
        targetReps: match ? match.defaultReps : 10,
        targetWeightKg: match ? match.defaultWeightKg : 20,
      };
    });

    const newRot: Routine = {
      id: `rot-${Date.now()}`,
      name: routineName,
      tagline: routineTagline || 'Custom routine block',
      modality: 'strength',
      category: routineCategory,
      estimatedMinutes: Math.max(25, items.length * 12),
      createdAt: new Date().toISOString(),
      items: items.length > 0 ? items : [{ exerciseId: exercises[0]?.id || 'ex-1', sets: 4, targetReps: 10, targetWeightKg: 25 }],
    };

    onAddRoutine(newRot);
    setShowNewRoutineModal(false);
    setRoutineName('');
    setRoutineTagline('');
    setSelectedExerciseIds([]);
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;

    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: exName,
      category: exCategory,
      muscleGroup: exMuscle,
      defaultSets: exSets,
      defaultReps: exReps,
      defaultWeightKg: exWeight,
    };

    onAddExercise(newEx);
    setShowNewExerciseModal(false);
    setExName('');
  };

  const toggleSelectExercise = (id: string) => {
    if (selectedExerciseIds.includes(id)) {
      setSelectedExerciseIds(selectedExerciseIds.filter((x) => x !== id));
    } else {
      setSelectedExerciseIds([...selectedExerciseIds, id]);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
            Routine & Exercise Database
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Build, edit, and organize your personalized workout routines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="glass-button" onClick={() => setShowNewExerciseModal(true)}>
            <IconPlus size={16} /> New Exercise
          </button>
          <button className="glass-button glass-button-accent" onClick={() => setShowNewRoutineModal(true)}>
            <IconPlus size={16} color="#fff" /> New Routine
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {routines.map((rot) => (
          <div key={rot.id} className="glass-card glass-card-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="metric-pill" style={{ color: rot.modality === 'yoga' ? 'var(--apple-purple)' : rot.modality === 'cardio' ? 'var(--apple-green)' : 'var(--apple-blue)', borderColor: 'rgba(0,0,0,0.1)' }}>
                  {rot.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>~{rot.estimatedMinutes} mins</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>{rot.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{rot.tagline}</p>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px', marginBottom: '20px' }}>
                <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  {rot.modality === 'yoga' ? 'Yoga Pose Sequence' : rot.modality === 'cardio' ? 'Cardio Target Metrics' : `Exercise Sequence (${rot.items.length})`}
                </h5>
                {rot.modality === 'strength' && (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {rot.items.map((item, idx) => {
                      const ex = exercises.find((e) => e.id === item.exerciseId);
                      return (
                        <li key={idx} style={{ fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>{ex ? ex.name : 'Exercise'}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            {item.sets} × {item.targetReps} reps @ {item.targetWeightKg}kg
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <button className="glass-button glass-button-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onStartRoutine(rot)}>
              <IconPlay size={16} color="#fff" /> Start Routine
            </button>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h3 className="section-title">Exercise Database ({exercises.length})</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {exercises.map((ex) => (
          <div key={ex.id} className="glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{ex.name}</h4>
              <span className="metric-pill" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {ex.muscleGroup}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Category: {ex.category} • Default: {ex.defaultSets} × {ex.defaultReps} @ {ex.defaultWeightKg}kg
            </p>
          </div>
        ))}
      </div>

      {showNewRoutineModal && (
        <div className="active-session-overlay">
          <div className="glass-card active-session-modal" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>Build Custom Routine</h3>
            <form onSubmit={handleCreateRoutine}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Routine Name</label>
                <input className="glass-input" required placeholder="e.g. Arms & Core Blast" value={routineName} onChange={(e) => setRoutineName(e.target.value)} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Tagline</label>
                <input className="glass-input" placeholder="e.g. High density pump" value={routineTagline} onChange={(e) => setRoutineTagline(e.target.value)} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Select Exercises:</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {exercises.map((ex) => {
                    const isSelected = selectedExerciseIds.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => toggleSelectExercise(ex.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'rgba(0, 113, 227, 0.12)' : 'rgba(0, 0, 0, 0.03)',
                          border: isSelected ? '1px solid var(--apple-blue)' : '1px solid transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{ex.name} ({ex.muscleGroup})</span>
                        {isSelected && <IconCheck size={16} color="var(--apple-blue)" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="glass-button" onClick={() => setShowNewRoutineModal(false)}>Cancel</button>
                <button type="submit" className="glass-button glass-button-primary">Save Routine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewExerciseModal && (
        <div className="active-session-overlay">
          <div className="glass-card active-session-modal" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>Add New Exercise</h3>
            <form onSubmit={handleCreateExercise}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Exercise Name</label>
                <input className="glass-input" required placeholder="e.g. Bulgarian Split Squat" value={exName} onChange={(e) => setExName(e.target.value)} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Target Muscle Group</label>
                <select className="glass-input" value={exMuscle} onChange={(e) => setExMuscle(e.target.value as MuscleGroup)}>
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Biceps">Biceps</option>
                  <option value="Triceps">Triceps</option>
                  <option value="Legs">Legs</option>
                  <option value="Core">Core</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sets</label>
                  <input type="number" className="glass-input" value={exSets} onChange={(e) => setExSets(parseInt(e.target.value, 10) || 1)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Reps</label>
                  <input type="number" className="glass-input" value={exReps} onChange={(e) => setExReps(parseInt(e.target.value, 10) || 1)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Weight (kg)</label>
                  <input type="number" className="glass-input" value={exWeight} onChange={(e) => setExWeight(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="glass-button" onClick={() => setShowNewExerciseModal(false)}>Cancel</button>
                <button type="submit" className="glass-button glass-button-accent">Create Exercise</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
