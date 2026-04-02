import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  roomUrl: string;
  onLeave: () => void;
  isAudioOnly?: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomUrl, onLeave, isAudioOnly = false }) => {
  const [callFrame, setCallFrame] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a demo room if none provided
    const actualRoomUrl = roomUrl || 'https://inkoria.daily.co/hello';
    
    const frame = DailyIframe.createFrame(containerRef.current!, {
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: { width: '100%', height: '100%', border: 'none' },
      showLocalVideo: !isAudioOnly,
    });
    
    frame.join({ url: actualRoomUrl });
    
    frame.on('left-meeting', () => {
      onLeave();
    });
    
    frame.on('error', (e: any) => {
      console.error('Call error:', e);
      alert('Call failed. Please try again.');
      onLeave();
    });
    
    setCallFrame(frame);
    
    return () => {
      if (frame) {
        frame.destroy();
      }
    };
  }, [roomUrl, isAudioOnly]);

  const toggleMute = () => {
    if (callFrame) {
      callFrame.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (callFrame && !isAudioOnly) {
      callFrame.setLocalVideo(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = () => {
    if (callFrame) {
      callFrame.leave();
    }
    onLeave();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div ref={containerRef} style={{ flex: 1, background: '#1a1a2e' }} />
      
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={toggleMute}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: isMuted ? '#ff6b6b' : '#333',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isMuted ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
        </button>
        
        {!isAudioOnly && (
          <button
            onClick={toggleVideo}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: isVideoOff ? '#ff6b6b' : '#333',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isVideoOff ? <VideoOff size={24} color="white" /> : <Video size={24} color="white" />}
          </button>
        )}
        
        <button
          onClick={leaveCall}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#ff4444',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <PhoneOff size={24} color="white" />
        </button>
      </div>
    </div>
  );
};