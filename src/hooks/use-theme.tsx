import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

export type AppTheme = "dark" | "light" | "midnight" | "forest" | "sunset" | "ocean" | "rose" | "zinator" | "cyberpunk" | "bloodred" | "ice" | "gold" | "transparent";

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: true,
});

const darkThemes: AppTheme[] = ["dark", "midnight", "forest", "ocean", "zinator", "cyberpunk", "bloodred", "gold", "transparent"];

const allThemeClasses = [
  "dark", "theme-midnight", "theme-forest", "theme-sunset", "theme-ocean", "theme-rose",
  "theme-zinator", "theme-cyberpunk", "theme-bloodred", "theme-ice", "theme-gold", "theme-transparent"
];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app-theme") as AppTheme | null;
      if (saved) return saved;
    }
    return "dark";
  });

  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...allThemeClasses);

    if (isDark) root.classList.add("dark");
    if (theme !== "dark" && theme !== "light") root.classList.add(`theme-${theme}`);

    localStorage.setItem("app-theme", theme);
  }, [theme, isDark]);

  const setTheme = useCallback((t: AppTheme) => setThemeState(t), []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (isDark ? "light" : "dark"));
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
