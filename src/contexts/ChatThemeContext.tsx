import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface ChatThemeDefinition {
  key: string;
  label: string;
  category: "global" | "chat";
  colors: string[];
  preview: string;
  vars: Record<string, string>;
}

export interface GlobalChatPrefs {
  themeKey: string;
  fontSize: number;
  fontKey: string;
  wallpaperKey: string;
  customWallpaperUrl: string;
}

const defaultPrefs: GlobalChatPrefs = {
  themeKey: "default",
  fontSize: 14,
  fontKey: "inter",
  wallpaperKey: "none",
  customWallpaperUrl: "",
};

// Chat-specific themes that override the global theme inside a conversation
export const chatThemes: ChatThemeDefinition[] = [
  {
    key: "default",
    label: "Default",
    category: "chat",
    colors: ["transparent"],
    preview: "Uses your global theme",
    vars: {},
  },
  {
    key: "romantic",
    label: "Romantic",
    category: "chat",
    colors: ["#4a0020", "#ff1a5c", "#ff6b9d"],
    preview: "Soft reds & pinks",
    vars: {
      "--chat-bg": "340 40% 8%",
      "--chat-card": "340 35% 12%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(340, 80%, 45%), hsl(350, 90%, 55%))",
      "--chat-bubble-recv": "340 30% 16%",
      "--chat-accent": "340 80% 55%",
      "--chat-text": "340 20% 92%",
      "--chat-muted": "340 15% 50%",
      "--chat-border": "340 25% 18%",
    },
  },
  {
    key: "gaming",
    label: "Gaming",
    category: "chat",
    colors: ["#0a0a0a", "#00ff88", "#ff00ff"],
    preview: "Dark neon gamer vibe",
    vars: {
      "--chat-bg": "160 30% 4%",
      "--chat-card": "160 25% 8%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(160, 100%, 35%), hsl(280, 100%, 50%))",
      "--chat-bubble-recv": "160 20% 12%",
      "--chat-accent": "160 100% 45%",
      "--chat-text": "160 30% 92%",
      "--chat-muted": "160 15% 45%",
      "--chat-border": "160 20% 14%",
    },
  },
  {
    key: "work",
    label: "Professional",
    category: "chat",
    colors: ["#f8fafc", "#1e40af", "#3b82f6"],
    preview: "Clean & distraction-free",
    vars: {
      "--chat-bg": "210 40% 97%",
      "--chat-card": "210 30% 99%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(220, 80%, 50%), hsl(220, 70%, 60%))",
      "--chat-bubble-recv": "210 25% 93%",
      "--chat-accent": "220 80% 50%",
      "--chat-text": "220 30% 15%",
      "--chat-muted": "220 15% 50%",
      "--chat-border": "210 20% 88%",
    },
  },
  {
    key: "fun",
    label: "Fun & Playful",
    category: "chat",
    colors: ["#fef08a", "#f472b6", "#34d399"],
    preview: "Bright & colorful",
    vars: {
      "--chat-bg": "50 80% 95%",
      "--chat-card": "50 60% 97%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(330, 80%, 60%), hsl(280, 70%, 55%))",
      "--chat-bubble-recv": "160 40% 90%",
      "--chat-accent": "330 80% 60%",
      "--chat-text": "330 30% 15%",
      "--chat-muted": "330 15% 45%",
      "--chat-border": "50 30% 85%",
    },
  },
  {
    key: "minimal",
    label: "Minimalist",
    category: "chat",
    colors: ["#ffffff", "#000000", "#666666"],
    preview: "Just text, no bubbles",
    vars: {
      "--chat-bg": "0 0% 100%",
      "--chat-card": "0 0% 100%",
      "--chat-bubble-sent": "none",
      "--chat-bubble-recv": "0 0% 96%",
      "--chat-accent": "0 0% 0%",
      "--chat-text": "0 0% 10%",
      "--chat-muted": "0 0% 55%",
      "--chat-border": "0 0% 90%",
    },
  },
  {
    key: "ocean-chat",
    label: "Ocean Breeze",
    category: "chat",
    colors: ["#0c4a6e", "#0ea5e9", "#67e8f9"],
    preview: "Deep sea calm",
    vars: {
      "--chat-bg": "200 50% 6%",
      "--chat-card": "200 45% 10%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(200, 90%, 40%), hsl(180, 80%, 45%))",
      "--chat-bubble-recv": "200 35% 14%",
      "--chat-accent": "200 90% 50%",
      "--chat-text": "200 20% 92%",
      "--chat-muted": "200 15% 50%",
      "--chat-border": "200 30% 16%",
    },
  },
  {
    key: "matrix",
    label: "Matrix",
    category: "chat",
    colors: ["#000000", "#00ff00", "#003300"],
    preview: "Terminal hacker vibe",
    vars: {
      "--chat-bg": "0 0% 2%",
      "--chat-card": "120 20% 5%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(120, 100%, 25%), hsl(120, 80%, 35%))",
      "--chat-bubble-recv": "120 15% 8%",
      "--chat-accent": "120 100% 50%",
      "--chat-text": "120 100% 70%",
      "--chat-muted": "120 30% 35%",
      "--chat-border": "120 20% 12%",
    },
  },
  {
    key: "royal",
    label: "Royal Purple",
    category: "chat",
    colors: ["#1e1b4b", "#fbbf24", "#a78bfa"],
    preview: "Luxury gold & purple",
    vars: {
      "--chat-bg": "245 40% 8%",
      "--chat-card": "245 35% 12%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(43, 96%, 56%), hsl(28, 80%, 50%))",
      "--chat-bubble-recv": "245 30% 16%",
      "--chat-accent": "43 96% 56%",
      "--chat-text": "245 20% 92%",
      "--chat-muted": "245 15% 50%",
      "--chat-border": "245 25% 18%",
    },
  },
  {
    key: "sunset-chat",
    label: "Warm Sunset",
    category: "chat",
    colors: ["#451a03", "#f97316", "#fbbf24"],
    preview: "Golden hour warmth",
    vars: {
      "--chat-bg": "30 50% 6%",
      "--chat-card": "30 40% 10%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(25, 95%, 50%), hsl(40, 90%, 55%))",
      "--chat-bubble-recv": "30 30% 14%",
      "--chat-accent": "25 95% 53%",
      "--chat-text": "30 20% 92%",
      "--chat-muted": "30 15% 50%",
      "--chat-border": "30 25% 16%",
    },
  },
  {
    key: "neon",
    label: "Neon Glow",
    category: "chat",
    colors: ["#0a0012", "#ff00ff", "#00ffff"],
    preview: "Electric neon lights",
    vars: {
      "--chat-bg": "270 50% 4%",
      "--chat-card": "270 40% 8%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(300, 100%, 50%), hsl(180, 100%, 50%))",
      "--chat-bubble-recv": "270 30% 12%",
      "--chat-accent": "300 100% 60%",
      "--chat-text": "270 30% 92%",
      "--chat-muted": "270 20% 50%",
      "--chat-border": "270 25% 14%",
    },
  },
  {
    key: "dark-zinator",
    label: "Dark Zinator",
    category: "chat",
    colors: ["#0a0a0a", "#00ff00", "#00cc66"],
    preview: "Neon glass interface",
    vars: {
      "--chat-bg": "120 10% 3%",
      "--chat-card": "120 15% 6%",
      "--chat-bubble-sent": "linear-gradient(135deg, hsl(120, 100%, 40%), hsl(150, 80%, 35%))",
      "--chat-bubble-recv": "120 10% 10%",
      "--chat-accent": "120 100% 50%",
      "--chat-text": "120 50% 85%",
      "--chat-muted": "120 20% 40%",
      "--chat-border": "120 15% 12%",
    },
  },
];

interface ChatThemeContextType {
  getChatTheme: (chatId: string) => string;
  setChatTheme: (chatId: string, themeKey: string) => void;
  getThemeVars: (chatId: string) => Record<string, string>;
  globalPrefs: GlobalChatPrefs;
  setGlobalPrefs: (prefs: GlobalChatPrefs) => void;
}

const ChatThemeContext = createContext<ChatThemeContextType>({
  getChatTheme: () => "default",
  setChatTheme: () => {},
  getThemeVars: () => ({}),
  globalPrefs: defaultPrefs,
  setGlobalPrefs: () => {},
});

const STORAGE_KEY = "inkoria-chat-themes";
const PREFS_KEY = "inkoria-chat-prefs";

export const ChatThemeProvider = ({ children }: { children: ReactNode }) => {
  const [chatThemeMap, setChatThemeMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [globalPrefs, setGlobalPrefsState] = useState<GlobalChatPrefs>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  // Load from DB on mount
  useEffect(() => {
    const loadFromDb = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("chat_theme_prefs").eq("id", user.id).single();
      if (data?.chat_theme_prefs && typeof data.chat_theme_prefs === "object") {
        const prefs = { ...defaultPrefs, ...(data.chat_theme_prefs as any) };
        setGlobalPrefsState(prefs);
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      }
    };
    loadFromDb();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatThemeMap));
  }, [chatThemeMap]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(globalPrefs));
  }, [globalPrefs]);

  const getChatTheme = useCallback((chatId: string) => chatThemeMap[chatId] || globalPrefs.themeKey || "default", [chatThemeMap, globalPrefs.themeKey]);

  const setChatTheme = useCallback((chatId: string, themeKey: string) => {
    setChatThemeMap((prev) => {
      if (themeKey === "default" || themeKey === globalPrefs.themeKey) {
        const next = { ...prev };
        delete next[chatId];
        return next;
      }
      return { ...prev, [chatId]: themeKey };
    });
  }, [globalPrefs.themeKey]);

  const getThemeVars = useCallback((chatId: string) => {
    const themeKey = chatThemeMap[chatId] || globalPrefs.themeKey || "default";
    const theme = chatThemes.find((t) => t.key === themeKey);
    return theme?.vars || {};
  }, [chatThemeMap, globalPrefs.themeKey]);

  const setGlobalPrefs = useCallback((prefs: GlobalChatPrefs) => {
    setGlobalPrefsState(prefs);
  }, []);

  return (
    <ChatThemeContext.Provider value={{ getChatTheme, setChatTheme, getThemeVars, globalPrefs, setGlobalPrefs }}>
      {children}
    </ChatThemeContext.Provider>
  );
};

export const useChatTheme = () => useContext(ChatThemeContext);
