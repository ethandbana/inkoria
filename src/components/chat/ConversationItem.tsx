interface Conversation {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isOnline: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
  formatTime: (t: string) => string;
}

const ConversationItem = ({ conversation: c, onClick, formatTime }: ConversationItemProps) => {
  const initial = c.displayName.charAt(0).toUpperCase();

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left">
      <div className="relative shrink-0">
        {c.avatarUrl ? (
          <img src={c.avatarUrl} alt={c.displayName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{initial}</div>
        )}
        {c.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />}
        {c.unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">{c.unread}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold font-body">{c.displayName}</span>
          <span className="text-xs text-muted-foreground font-body">{formatTime(c.lastTime)}</span>
        </div>
        <p className="text-sm text-muted-foreground font-body truncate">{c.lastMessage}</p>
      </div>
    </button>
  );
};

export default ConversationItem;
