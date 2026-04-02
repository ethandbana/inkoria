import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onDoubleClick?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  autoPlay = false, 
  muted = true,
  className = "",
  onDoubleClick 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [autoPlay]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 2000);
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-cover cursor-pointer rounded-lg"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDoubleClick={onDoubleClick}
        playsInline
      />
      
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3 hover:bg-black/70 transition-all"
        >
          <Play size={32} color="white" fill="white" />
        </button>
      )}
      
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-white/80 transition">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-white/80 transition">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-white text-xs">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-white/80 transition">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};