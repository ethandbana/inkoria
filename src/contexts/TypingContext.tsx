import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingNotification {
  userId: string;
  userName: string;
  chatId: string;
  timestamp: number;
}

interface TypingContextType {
  activeTyping: TypingNotification[];
  clearTyping: (userId: string, chatId: string) => void;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export const TypingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTyping, setActiveTyping] = useState<TypingNotification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("typing-global");

    channel.on("broadcast", { event: "typing" }, (payload: any) => {
      const { userId, userName, chatId } = payload.payload;

      if (userId === user.id) return;

      setActiveTyping((prev) => {
        const filtered = prev.filter((t) => !(t.userId === userId && t.chatId === chatId));
        return [...filtered, { userId, userName, chatId, timestamp: Date.now() }];
      });

      setTimeout(() => {
        setActiveTyping((prev) => prev.filter((t) => !(t.userId === userId && t.chatId === chatId)));
      }, 3000);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const clearTyping = (userId: string, chatId: string) => {
    setActiveTyping((prev) => prev.filter((t) => !(t.userId === userId && t.chatId === chatId)));
  };

  return (
    <TypingContext.Provider value={{ activeTyping, clearTyping }}>
      {children}
    </TypingContext.Provider>
  );
};

export const useTyping = () => {
  const context = useContext(TypingContext);
  if (!context) throw new Error("useTyping must be used within TypingProvider");
  return context;
};
