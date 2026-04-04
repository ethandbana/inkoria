import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useState } from "react";

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string | null;
  callType: "audio" | "video";
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallModal = ({ callerName, callerAvatar, callType, onAccept, onDecline }: IncomingCallModalProps) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 1000);
    // Auto-decline after 45 seconds
    const timeout = setTimeout(onDecline, 45000);
    // Play ringtone
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    audio.play().catch(() => {});
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onDecline]);

  const initial = (callerName || "?").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-card/90 backdrop-blur-xl shadow-2xl border border-border max-w-xs w-full mx-4">
        {/* Pulsing avatar */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full bg-green-500/30 transition-transform duration-1000 ${pulse ? "scale-150 opacity-0" : "scale-100 opacity-50"}`} />
          <div className={`absolute inset-0 rounded-full bg-green-500/20 transition-transform duration-1000 delay-300 ${pulse ? "scale-[1.8] opacity-0" : "scale-100 opacity-30"}`} />
          {callerAvatar ? (
            <img src={callerAvatar} alt="" className="w-24 h-24 rounded-full object-cover relative z-10 border-4 border-green-500" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground relative z-10 border-4 border-green-500">
              {initial}
            </div>
          )}
        </div>

        {/* Caller info */}
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-foreground">{callerName}</p>
          <p className="text-sm text-muted-foreground animate-pulse">
            {callType === "video" ? "Incoming video call..." : "Incoming voice call..."}
          </p>
        </div>

        {/* Accept / Decline buttons */}
        <div className="flex items-center gap-8 mt-4">
          <button
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-all active:scale-95 animate-bounce"
          >
            {callType === "video" ? (
              <Video className="w-7 h-7 text-white" />
            ) : (
              <Phone className="w-7 h-7 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
