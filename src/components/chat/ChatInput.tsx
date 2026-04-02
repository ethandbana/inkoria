import { useState, useRef } from "react";
import { Send, Image, Paperclip, Camera, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VoiceRecorder from "./VoiceRecorder";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendMedia: (file: File) => void;
  onSendVoice: (blob: Blob) => void;
  onTyping: () => void;
  bgStyle?: React.CSSProperties;
  borderStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  mutedStyle?: React.CSSProperties;
}

const ChatInput = ({ onSendText, onSendMedia, onSendVoice, onTyping, bgStyle, borderStyle, inputStyle, mutedStyle }: ChatInputProps) => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const mediaRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
    else onTyping();
  };

  return (
    <div className="p-3 border-t border-border" style={{ ...borderStyle, ...bgStyle }}>
      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-2"
          >
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setText((prev) => prev + emoji.emoji);
                setShowEmoji(false);
              }}
              width="100%"
              height={300}
              skinTonesDisabled
              searchDisabled={false}
              lazyLoadEmojis
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action row */}
      <div className="flex gap-1 mb-2 items-center">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowEmoji(!showEmoji)}>
          <Smile className="w-4 h-4" style={mutedStyle} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => mediaRef.current?.click()}>
          <Image className="w-4 h-4" style={mutedStyle} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => fileRef.current?.click()}>
          <Paperclip className="w-4 h-4" style={mutedStyle} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => cameraRef.current?.click()}>
          <Camera className="w-4 h-4" style={mutedStyle} />
        </Button>
        <VoiceRecorder onSend={onSendVoice} mutedStyle={mutedStyle} />
      </div>

      {/* Text input + send */}
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="bg-secondary border-0 font-body"
          style={inputStyle}
        />
        <Button onClick={handleSend} size="icon" className="gradient-primary border-0 text-primary-foreground shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input ref={mediaRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
      <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
    </div>
  );
};

export default ChatInput;
