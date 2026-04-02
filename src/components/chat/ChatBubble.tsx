import { Paperclip, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  msg: any;
  isSent: boolean;
  hasChatTheme: boolean;
  sentStyle: React.CSSProperties;
  recvStyle: React.CSSProperties;
}

const ChatBubble = ({ msg, isSent, hasChatTheme, sentStyle, recvStyle }: ChatBubbleProps) => {
  return (
    <div className={cn("flex", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl text-sm font-body overflow-hidden",
          !hasChatTheme && (isSent ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"),
          hasChatTheme && (isSent ? "rounded-br-md" : "rounded-bl-md")
        )}
        style={isSent ? sentStyle : recvStyle}
      >
        {msg.media_url && msg.media_type === "image" && (
          <img src={msg.media_url} alt="" className="w-full max-w-[280px] rounded-t-2xl object-cover cursor-pointer" onClick={() => window.open(msg.media_url, "_blank")} />
        )}
        {msg.media_url && msg.media_type === "video" && (
          <video src={msg.media_url} controls className="w-full max-w-[280px] rounded-t-2xl" />
        )}
        {msg.media_url && msg.media_type === "audio" && (
          <div className="px-4 py-2">
            <audio src={msg.media_url} controls className="w-full max-w-[240px] h-8" />
          </div>
        )}
        {msg.media_url && msg.media_type === "file" && (
          <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 hover:underline">
            <Paperclip className="w-4 h-4" /> Download file
          </a>
        )}
        <div className="px-4 py-2.5">
          <p>{msg.content}</p>
          <div className={cn("flex items-center gap-1 mt-1", isSent ? "justify-end" : "justify-start")}>
            <span className={cn("text-[9px] opacity-70", !hasChatTheme && (isSent ? "text-primary-foreground" : "text-muted-foreground"))}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isSent && (
              msg.is_read ? (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              ) : (
                <Check className="w-3 h-3 opacity-50" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
