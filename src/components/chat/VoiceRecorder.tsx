import { useState, useRef } from "react";
import { Mic, Square, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
  onSend: (blob: Blob) => void;
  mutedStyle?: React.CSSProperties;
}

const VoiceRecorder = ({ onSend, mutedStyle }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) onSend(blob);
        setDuration(0);
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      // Microphone not available
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AnimatePresence mode="wait">
      {recording ? (
        <motion.div
          key="recording"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-2"
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-body text-muted-foreground tabular-nums">{formatDuration(duration)}</span>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={stopRecording}>
            <Send className="w-4 h-4 text-primary" />
          </Button>
        </motion.div>
      ) : (
        <motion.div key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={startRecording}>
            <Mic className="w-4 h-4" style={mutedStyle} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceRecorder;
