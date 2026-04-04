import Layout from "@/components/Layout";
import { Search, PenSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useChatTheme } from "@/contexts/ChatThemeContext";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import ConversationItem from "@/components/chat/ConversationItem";
import TypingIndicator from "@/components/chat/TypingIndicator";
import NewConversationModal from "@/components/NewConversationModal";
import { VideoCall } from "@/components/VideoCall";
import IncomingCallModal from "@/components/IncomingCallModal";
import { useIncomingCalls } from "@/hooks/useIncomingCalls";

interface Conversation {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isOnline: boolean;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getThemeVars, globalPrefs } = useChatTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [activeCall, setActiveCall] = useState<{ url: string; isAudioOnly: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { incomingCall, acceptCall, declineCall } = useIncomingCalls(user?.id);

  // Per-chat theme CSS variables
  const chatVars = useMemo(() => {
    if (!activeChat) return {};
    return getThemeVars(activeChat);
  }, [activeChat, getThemeVars]);
  const hasChatTheme = Object.keys(chatVars).length > 0;

  // Auto-open chat from URL param ?chat=userId
  useEffect(() => {
    const chatParam = searchParams.get("chat");
    if (chatParam && user && !activeChat) {
      openChat(chatParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          if (activeChat && (msg.sender_id === activeChat || msg.receiver_id === activeChat)) {
            setMessages((prev) => [...prev, msg]);
          }
          fetchConversations();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (activeChat && (msg.sender_id === user.id || msg.receiver_id === user.id)) {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat]);

  // Typing indicator channel
  useEffect(() => {
    if (!user || !activeChat) return;
    const channel = supabase.channel(`typing-${[user.id, activeChat].sort().join("-")}`);
    channel
      .on("broadcast", { event: "typing" }, (payload: any) => {
        if (payload.payload?.userId !== user.id) {
          setIsPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 2500);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: sent } = await supabase.from("messages").select("*").eq("sender_id", user.id).order("created_at", { ascending: false });
    const { data: received } = await supabase.from("messages").select("*").eq("receiver_id", user.id).order("created_at", { ascending: false });
    const allMessages = [...(sent || []), ...(received || [])];
    const partnerIds = new Set<string>();
    allMessages.forEach((m) => {
      if (m.sender_id !== user.id) partnerIds.add(m.sender_id);
      if (m.receiver_id !== user.id) partnerIds.add(m.receiver_id);
    });
    if (partnerIds.size === 0) { setConversations([]); return; }
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", Array.from(partnerIds));
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    const convos: Conversation[] = [];
    partnerIds.forEach((pid) => {
      const partnerMsgs = allMessages.filter((m) => m.sender_id === pid || m.receiver_id === pid).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const last = partnerMsgs[0];
      const profile = profileMap.get(pid);
      const unread = partnerMsgs.filter((m) => m.sender_id === pid && !m.is_read).length;
      convos.push({
        userId: pid,
        displayName: profile?.display_name || profile?.username || "User",
        avatarUrl: profile?.avatar_url,
        lastMessage: last?.media_url ? "📎 Media" : last?.content || "",
        lastTime: last?.created_at || "",
        unread,
        isOnline: profile?.is_online || false,
      });
    });
    convos.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
    setConversations(convos);
  };

  const openChat = async (partnerId: string) => {
    setActiveChat(partnerId);
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", partnerId).single();
    setChatPartner(profile);
    const { data } = await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user!.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    await supabase.from("messages").update({ is_read: true }).eq("sender_id", partnerId).eq("receiver_id", user!.id).eq("is_read", false);
  };

  const sendMessage = async (content: string) => {
    if (!activeChat || !user) return;
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: activeChat, content });
    if (error) toast.error("Failed to send");
  };

  const sendMedia = async (file: File) => {
    if (!activeChat || !user) return;
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/chat_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("uploads").upload(filePath, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filePath);
      const mediaType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id, receiver_id: activeChat,
        content: mediaType === "image" ? "📷 Photo" : mediaType === "video" ? "🎥 Video" : `📎 ${file.name}`,
        media_url: urlData.publicUrl, media_type: mediaType,
      });
      if (error) throw error;
    } catch (err: any) { toast.error(err.message); }
  };

  const sendVoice = async (blob: Blob) => {
    if (!activeChat || !user) return;
    try {
      const filePath = `${user.id}/voice_${Date.now()}.webm`;
      const { error: uploadErr } = await supabase.storage.from("uploads").upload(filePath, blob);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filePath);
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id, receiver_id: activeChat,
        content: "🎤 Voice note",
        media_url: urlData.publicUrl, media_type: "audio",
      });
      if (error) throw error;
    } catch (err: any) { toast.error(err.message); }
  };

  const broadcastTyping = useCallback(() => {
    if (!user || !activeChat) return;
    const channelName = `typing-${[user.id, activeChat].sort().join("-")}`;
    supabase.channel(channelName).send({ type: "broadcast", event: "typing", payload: { userId: user.id } });
  }, [user, activeChat]);

  const startCall = async (callType: "audio" | "video") => {
    if (!activeChat || !user) return;
    toast.info(`Starting ${callType} call...`);
    try {
      const { data, error } = await supabase.functions.invoke("create-daily-room", {
        body: { partnerId: activeChat, callType },
      });
      if (error) throw error;
      if (data?.url) {
        setActiveCall({ url: data.url, isAudioOnly: callType === "audio" });
      }
    } catch (err: any) {
      toast.error("Failed to start call: " + (err.message || "Unknown error"));
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground font-body">Sign in to view messages</p>
          <Button onClick={() => navigate("/auth")} className="gradient-primary border-0 text-primary-foreground font-body">Sign In</Button>
        </div>
      </Layout>
    );
  }

  // ── Active chat view ──
  if (activeChat && chatPartner) {
    const bgStyle = hasChatTheme ? { backgroundColor: `hsl(${chatVars["--chat-bg"]})` } : {};
    const borderStyle = hasChatTheme ? { borderColor: `hsl(${chatVars["--chat-border"]})` } : {};
    const textStyle = hasChatTheme ? { color: `hsl(${chatVars["--chat-text"]})` } : {};
    const mutedStyle = hasChatTheme ? { color: `hsl(${chatVars["--chat-muted"]})` } : {};

    const getSentBubbleStyle = (): React.CSSProperties => {
      if (!hasChatTheme) return {};
      const val = chatVars["--chat-bubble-sent"];
      if (val.startsWith("linear-gradient") || val.startsWith("none")) {
        return val === "none" ? {} : { background: val, color: "white" };
      }
      return { backgroundColor: `hsl(${val})`, color: "white" };
    };

    const getRecvBubbleStyle = (): React.CSSProperties => {
      if (!hasChatTheme) return {};
      return { backgroundColor: `hsl(${chatVars["--chat-bubble-recv"]})`, color: `hsl(${chatVars["--chat-text"]})` };
    };

    const inputStyle = hasChatTheme ? { backgroundColor: `hsl(${chatVars["--chat-bubble-recv"]})`, color: `hsl(${chatVars["--chat-text"]})` } : {};

    const fontFamily = globalPrefs.fontKey === "playfair" ? "'Playfair Display', serif" : globalPrefs.fontKey === "mono" ? "'Courier New', monospace" : globalPrefs.fontKey === "system" ? "system-ui, sans-serif" : "'Inter', sans-serif";
    const wallpaperStyle: React.CSSProperties = globalPrefs.customWallpaperUrl
      ? { backgroundImage: `url(${globalPrefs.customWallpaperUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
      : {};

    return (
      <Layout>
        {activeCall && (
          <VideoCall roomUrl={activeCall.url} isAudioOnly={activeCall.isAudioOnly} onLeave={() => setActiveCall(null)} />
        )}
        {incomingCall && (
          <IncomingCallModal
            callerName={incomingCall.callerName}
            callerAvatar={incomingCall.callerAvatar}
            callType={incomingCall.callType}
            onAccept={() => {
              const call = acceptCall();
              if (call) {
                setActiveCall({ url: call.roomUrl, isAudioOnly: call.callType === "audio" });
              }
            }}
            onDecline={declineCall}
          />
        )}
        <div className="flex flex-col h-[calc(100vh-var(--nav-height)-var(--bottom-nav-height))]" style={{ ...bgStyle, fontFamily, ...wallpaperStyle }}>
          <ChatHeader partner={chatPartner} chatId={activeChat} onBack={() => setActiveChat(null)} onStartCall={startCall} bgStyle={bgStyle} borderStyle={borderStyle} textStyle={textStyle} mutedStyle={mutedStyle} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ fontSize: `${globalPrefs.fontSize}px` }}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} isSent={msg.sender_id === user.id} hasChatTheme={hasChatTheme} sentStyle={getSentBubbleStyle()} recvStyle={getRecvBubbleStyle()} />
            ))}
            {isPartnerTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSendText={sendMessage}
            onSendMedia={sendMedia}
            onSendVoice={sendVoice}
            onTyping={broadcastTyping}
            bgStyle={bgStyle}
            borderStyle={borderStyle}
            inputStyle={inputStyle}
            mutedStyle={mutedStyle}
          />
        </div>
      </Layout>
    );
  }

  // ── Conversation list ──
  const filtered = conversations.filter((c) => c.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      {showNewConversation && user && (
        <NewConversationModal
          currentUserId={user.id}
          onSelectUser={(userId) => openChat(userId)}
          onClose={() => setShowNewConversation(false)}
        />
      )}
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold">Messages</h2>
          <button
            onClick={() => setShowNewConversation(true)}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="New conversation"
          >
            <PenSquare className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-0 font-body" />
        </div>
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-muted-foreground font-body text-sm">No conversations yet</p>
              <p className="text-xs text-muted-foreground font-body">Tap the pen icon above to start a new chat</p>
              <Button variant="outline" onClick={() => setShowNewConversation(true)} className="font-body text-sm">Start a Conversation</Button>
            </div>
          ) : (
            filtered.map((c) => (
              <ConversationItem key={c.userId} conversation={c} onClick={() => openChat(c.userId)} formatTime={formatTime} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
