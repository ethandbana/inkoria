import { chatThemes } from "@/contexts/ChatThemeContext";
import { useChatTheme } from "@/contexts/ChatThemeContext";
import { cn } from "@/lib/utils";
import { Palette, Check, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatThemeSelectorProps {
  chatId: string;
}

const ChatThemeSelector = ({ chatId }: ChatThemeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { getChatTheme, setChatTheme } = useChatTheme();
  const currentTheme = getChatTheme(chatId);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Chat theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md max-h-[70vh] rounded-t-2xl sm:rounded-2xl bg-card border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">Chat Theme</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-2 max-h-[55vh]">
                {chatThemes.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => {
                      setChatTheme(chatId, theme.key);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      currentTheme === theme.key
                        ? "bg-primary/15 border-2 border-primary"
                        : "bg-secondary/50 border-2 border-transparent hover:border-primary/20"
                    )}
                  >
                    {/* Color preview dots */}
                    <div className="flex gap-1 shrink-0">
                      {theme.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-white/10"
                          style={{ backgroundColor: c === "transparent" ? "var(--background)" : c }}
                        />
                      ))}
                    </div>

                    {/* Label & description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-semibold">{theme.label}</p>
                      <p className="text-xs text-muted-foreground font-body">{theme.preview}</p>
                    </div>

                    {/* Check mark */}
                    {currentTheme === theme.key && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatThemeSelector;
