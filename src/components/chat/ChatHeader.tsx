import { ArrowLeft, Phone, Video } from "lucide-react";
import ChatThemeSelector from "@/components/ChatThemeSelector";

interface ChatHeaderProps {
  partner: any;
  chatId: string;
  onBack: () => void;
  onStartCall?: (type: "audio" | "video") => void;
  bgStyle?: React.CSSProperties;
  borderStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  mutedStyle?: React.CSSProperties;
}

const ChatHeader = ({ partner, chatId, onBack, onStartCall, bgStyle, borderStyle, textStyle, mutedStyle }: ChatHeaderProps) => {
  const initial = (partner.display_name || partner.username || "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border" style={{ ...borderStyle, ...bgStyle }}>
      <button onClick={onBack} className="text-muted-foreground hover:text-foreground" style={mutedStyle}>
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="relative">
        {partner.avatar_url ? (
          <img src={partner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{initial}</div>
        )}
        {partner.is_online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />}
      </div>
      <div className="flex-1" style={textStyle}>
        <p className="text-sm font-semibold font-body">{partner.display_name || partner.username}</p>
        <p className="text-[10px] font-body" style={mutedStyle}>{partner.is_online ? "Online" : "Offline"}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onStartCall?.("audio")}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          style={mutedStyle}
        >
          <Phone className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={() => onStartCall?.("video")}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          style={mutedStyle}
        >
          <Video className="w-4.5 h-4.5" />
        </button>
        <ChatThemeSelector chatId={chatId} />
      </div>
    </div>
  );
};

export default ChatHeader;
