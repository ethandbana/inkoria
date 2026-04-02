import React, { useState, useRef } from 'react';
import { Video, Square, Trash2, Send } from 'lucide-react';

interface VideoRecorderProps {
  onSend: (videoBlob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        setShowPreview(true);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please allow camera access to record video messages');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVideo = () => {
    if (videoUrl) {
      fetch(videoUrl)
        .then(res => res.blob())
        .then(blob => onSend(blob));
      setVideoUrl(null);
      setShowPreview(false);
    }
  };

  const discardVideo = () => {
    setVideoUrl(null);
    setShowPreview(false);
  };

  return (
    <div>
      {!isRecording && !showPreview && (
        <button
          onClick={startRecording}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '50%',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Video size={18} color="white" />
        </button>
      )}
      
      {isRecording && (
        <div style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: '200px',
              height: '150px',
              borderRadius: '12px',
              objectFit: 'cover'
            }}
          />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: '#ff6b6b', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
            <span style={{ color: 'white', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '8px' }}>Recording...</span>
          </div>
          <button
            onClick={stopRecording}
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: '#ff6b6b',
              border: 'none',
              borderRadius: '50%',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <Square size={12} color="white" />
          </button>
        </div>
      )}
      
      {showPreview && videoUrl && (
        <div style={{ position: 'relative' }}>
          <video
            src={videoUrl}
            controls
            style={{
              width: '200px',
              height: '150px',
              borderRadius: '12px',
              objectFit: 'cover'
            }}
          />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '8px' }}>
            <button
              onClick={discardVideo}
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} color="white" />
            </button>
            <button
              onClick={sendVideo}
              style={{
                background: '#4ade80',
                border: 'none',
                borderRadius: '50%',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <Send size={14} color="white" />
            </button>
          </div>
        </div>
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