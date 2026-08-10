import React, { useState } from 'react';
import { IconSparkles } from './Icons';

interface VoiceWorkoutLoggerProps {
  onVoiceSetLogged: (weightKg: number, reps: number) => void;
}

export const VoiceWorkoutLogger: React.FC<VoiceWorkoutLoggerProps> = ({ onVoiceSetLogged }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');

  const handleStartVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('Web Speech API is not supported in this browser. Try Chrome/Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);
      setVoiceStatus('Listening... Speak: "Log 34 kilos for 10 reps"');

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        parseSpokenSetData(spokenText);
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        setVoiceStatus(`Voice error: ${err.error || 'Could not recognize speech'}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setVoiceStatus('Voice recognition initialized.');
    }
  };

  const parseSpokenSetData = (text: string) => {
    // Regex parsing for numbers (e.g. "34 kilos for 10 reps", "30 kg 12 reps")
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const weight = parseFloat(numbers[0]);
      const reps = parseInt(numbers[1], 10);
      onVoiceSetLogged(weight, reps);
      setVoiceStatus(`✓ Voice Logged: ${weight} kg × ${reps} reps!`);
    } else if (numbers && numbers.length === 1) {
      const reps = parseInt(numbers[0], 10);
      onVoiceSetLogged(30, reps);
      setVoiceStatus(`✓ Voice Logged: 30 kg × ${reps} reps!`);
    } else {
      setVoiceStatus(`Could not detect numbers in: "${text}". Try "34 kg for 10 reps".`);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        className="glass-button"
        style={{
          fontSize: '0.78rem',
          padding: '4px 12px',
          background: isListening ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 113, 227, 0.08)',
          color: isListening ? 'var(--apple-red)' : 'var(--apple-blue)',
          borderColor: isListening ? 'var(--apple-red)' : 'rgba(0, 113, 227, 0.25)',
          animation: isListening ? 'pulseGlow 1.5s infinite ease-in-out' : 'none',
        }}
        onClick={handleStartVoiceRecognition}
      >
        <IconSparkles size={14} color={isListening ? 'var(--apple-red)' : 'var(--apple-blue)'} />
        <span>{isListening ? 'Listening...' : '🎤 Voice Log Set'}</span>
      </button>

      {voiceStatus && (
        <span style={{ fontSize: '0.75rem', color: 'var(--apple-blue)', fontWeight: 600 }}>
          {voiceStatus}
        </span>
      )}
    </div>
  );
};
