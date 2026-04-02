import React, { useState } from 'react';
import { Volume2, Music, Upload, X, Play, Check } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface SoundSettingsProps {
  onClose: () => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ onClose }) => {
  const [selectedSound, setSelectedSound] = useState('gentle');
  const [customSound, setCustomSound] = useState<File | null>(null);
  const [soundUrl, setSoundUrl] = useState<string | null>(null);

  const builtInSounds = [
    { id: 'gentle', name: 'Gentle Chime', icon: '🔔' },
    { id: 'ding', name: 'Classic Ding', icon: '✨' },
    { id: 'pop', name: 'Soft Pop', icon: '💫' },
    { id: 'chime', name: 'Musical Chime', icon: '🎵' },
    { id: 'beep', name: 'Simple Beep', icon: '📢' }
  ];

  const testSound = (soundId: string) => {
    soundManager.playBuiltIn(soundId as any);
  };

  const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomSound(file);
      const url = URL.createObjectURL(file);
      setSoundUrl(url);
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };

  const applyCustomSound = () => {
    if (customSound) {
      // Save to localStorage
      localStorage.setItem('notificationSound', 'custom');
      localStorage.setItem('customSoundName', customSound.name);
      alert('Custom sound saved!');
    }
  };

  const applyBuiltInSound = (soundId: string) => {
    setSelectedSound(soundId);
    localStorage.setItem('notificationSound', soundId);
    alert(`Sound set to ${builtInSounds.find(s => s.id === soundId)?.name}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: '90%',
        maxWidth: '500px',
        background: 'rgba(20,30,45,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '24px'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Volume2 size={24} color="white" />
            <h2 style={{ color: 'white', margin: 0 }}>Notification Sounds</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="white" />
          </button>
        </div>
        
        {/* Built-in Sounds */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>
            <Music size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Built-in Sounds
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {builtInSounds.map(sound => (
              <div key={sound.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{sound.icon}</span>
                  <span style={{ color: 'white' }}>{sound.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => testSound(sound.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={14} /> Test
                  </button>
                  <button
                    onClick={() => applyBuiltInSound(sound.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: selectedSound === sound.id ? 'rgba(100,150,255,0.3)' : 'rgba(255,255,255,0.1)',
                      border: selectedSound === sound.id ? '1px solid #7c9cff' : 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedSound === sound.id ? <Check size={14} /> : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Custom Sound Upload */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>
            <Upload size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Custom Sound
          </h3>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.3)',
            cursor: 'pointer',
            marginBottom: '12px'
          }}>
            <Upload size={20} color="white" />
            <span style={{ color: 'white' }}>Upload your own sound (MP3, WAV)</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleCustomSoundUpload}
              style={{ display: 'none' }}
            />
          </label>
          {customSound && (
            <div style={{
              padding: '12px',
              background: 'rgba(100,150,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'white', fontSize: '13px' }}>{customSound.name}</span>
              <button
                onClick={applyCustomSound}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};