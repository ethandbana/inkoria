import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface WebRTCCallProps {
  callType: "audio" | "video";
  partnerName: string;
  partnerAvatar: string | null;
  callState: "calling" | "connected";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

const WebRTCCall = ({
  callType,
  partnerName,
  partnerAvatar,
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}: WebRTCCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const initial = (partnerName || "?").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Video area */}
      {callType === "video" ? (
        <div className="flex-1 relative">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video (picture-in-picture) */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute bottom-24 right-4 w-[120px] h-[160px] object-cover rounded-xl border-2 border-white/50 shadow-lg"
          />

          {/* Calling overlay */}
          {callState === "calling" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center space-y-3">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt="" className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground mx-auto">
                    {initial}
                  </div>
                )}
                <p className="text-white text-lg font-semibold">{partnerName}</p>
                <p className="text-white/70 text-sm animate-pulse">Calling...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Audio call UI */
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80">
          {partnerAvatar ? (
            <img src={partnerAvatar} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl mb-6" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-bold text-white mb-6 border-4 border-white/30 shadow-2xl">
              {initial}
            </div>
          )}
          <p className="text-white text-xl font-semibold mb-2">{partnerName}</p>
          <p className="text-white/70 text-sm animate-pulse">
            {callState === "calling" ? "Calling..." : "Connected"}
          </p>
          {/* Hidden audio elements */}
          <audio ref={remoteVideoRef as any} autoPlay className="hidden" />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-5 px-4">
        <button
          onClick={onToggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isMuted ? "bg-red-500" : "bg-white/20 backdrop-blur-sm"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {callType === "video" && (
          <button
            onClick={onToggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isVideoOff ? "bg-red-500" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>
        )}

        <button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all active:scale-95"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default WebRTCCall;
