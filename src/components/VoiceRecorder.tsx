import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      setDuration(0);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record voice messages');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendRecording = () => {
    if (audioUrl) {
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => onSend(blob, duration));
      setAudioUrl(null);
      setDuration(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px' }}>
      {!isRecording && !audioUrl && (
        <button
          onClick={startRecording}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: '#ff6b6b'
          }}
        >
          <Mic size={18} color="white" />
        </button>
      )}
      
      {isRecording && (
        <>
          <div style={{ width: '8px', height: '8px', background: '#ff6b6b', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
          <span style={{ color: 'white', fontSize: '12px' }}>{formatTime(duration)}</span>
          <button
            onClick={stopRecording}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}
          >
            <Square size={14} color="white" />
          </button>
        </>
      )}
      
      {audioUrl && !isRecording && (
        <>
          <audio src={audioUrl} controls className="h-8 w-24" />
          <span style={{ color: 'white', fontSize: '11px' }}>{formatTime(duration)}</span>
          <button
            onClick={() => setAudioUrl(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%'
            }}
          >
            <Trash2 size={14} color="white" />
          </button>
          <button
            onClick={sendRecording}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '20px',
              color: 'white'
            }}
          >
            <Send size={14} />
          </button>
        </>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};