import { useState, useMemo } from "react";
import { chatThemes, ChatThemeDefinition } from "@/contexts/ChatThemeContext";
import { useChatTheme } from "@/contexts/ChatThemeContext";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Type, Palette, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const fontOptions = [
  { key: "inter", label: "Inter", family: "'Inter', sans-serif" },
  { key: "playfair", label: "Playfair", family: "'Playfair Display', serif" },
  { key: "mono", label: "Mono", family: "'Courier New', monospace" },
  { key: "system", label: "System", family: "system-ui, sans-serif" },
];

const wallpapers = [
  { key: "none", label: "None", value: "" },
  { key: "dots", label: "Dots", value: "radial-gradient(circle, hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px)" },
  { key: "grid", label: "Grid", value: "linear-gradient(hsl(var(--muted-foreground) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground) / 0.05) 1px, transparent 1px)" },
  { key: "gradient-warm", label: "Warm", value: "linear-gradient(135deg, hsl(24 80% 20% / 0.3), hsl(340 60% 20% / 0.3))" },
  { key: "gradient-cool", label: "Cool", value: "linear-gradient(135deg, hsl(200 80% 20% / 0.3), hsl(260 60% 20% / 0.3))" },
  { key: "gradient-night", label: "Night", value: "linear-gradient(180deg, hsl(240 30% 8% / 0.5), hsl(260 40% 15% / 0.5))" },
];

// Mock messages for preview
const previewMessages = [
  { id: "1", content: "Hey! Have you read the new chapter? 📖", isSent: false, time: "10:30 AM" },
  { id: "2", content: "Yes! It was amazing! The plot twist at the end was unexpected 🤯", isSent: true, time: "10:32 AM" },
  { id: "3", content: "Right?! I can't wait for the next one", isSent: false, time: "10:33 AM" },
];

interface ChatThemeSettingsProps {
  globalChatTheme?: string;
}

const ChatThemeSettings = ({ globalChatTheme }: ChatThemeSettingsProps) => {
  const { user } = useAuth();
  const { globalPrefs, setGlobalPrefs } = useChatTheme();
  const [selectedTheme, setSelectedTheme] = useState(globalPrefs.themeKey || "default");
  const [fontSize, setFontSize] = useState(globalPrefs.fontSize || 14);
  const [fontKey, setFontKey] = useState(globalPrefs.fontKey || "inter");
  const [wallpaperKey, setWallpaperKey] = useState(globalPrefs.wallpaperKey || "none");
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState(globalPrefs.customWallpaperUrl || "");
  const [expandedSection, setExpandedSection] = useState<string | null>("themes");
  const [saving, setSaving] = useState(false);

  const activeTheme = useMemo(() => chatThemes.find((t) => t.key === selectedTheme), [selectedTheme]);
  const activeFont = useMemo(() => fontOptions.find((f) => f.key === fontKey), [fontKey]);
  const activeWallpaper = useMemo(() => wallpapers.find((w) => w.key === wallpaperKey), [wallpaperKey]);

  // Compute preview styles
  const previewBg = activeTheme?.vars["--chat-bg"] ? `hsl(${activeTheme.vars["--chat-bg"]})` : undefined;
  const previewSent = activeTheme?.vars["--chat-bubble-sent"] || "";
  const previewRecv = activeTheme?.vars["--chat-bubble-recv"] ? `hsl(${activeTheme.vars["--chat-bubble-recv"]})` : undefined;
  const previewText = activeTheme?.vars["--chat-text"] ? `hsl(${activeTheme.vars["--chat-text"]})` : undefined;
  const previewMuted = activeTheme?.vars["--chat-muted"] ? `hsl(${activeTheme.vars["--chat-muted"]})` : undefined;

  const getSentStyle = (): React.CSSProperties => {
    if (!previewSent) return {};
    if (previewSent.startsWith("linear-gradient")) return { background: previewSent, color: "white" };
    if (previewSent === "none") return {};
    return { backgroundColor: `hsl(${previewSent})`, color: "white" };
  };

  const getWallpaperStyle = (): React.CSSProperties => {
    if (customWallpaperUrl) return { backgroundImage: `url(${customWallpaperUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
    if (activeWallpaper?.value) {
      const bgSize = wallpaperKey === "dots" ? "20px 20px" : wallpaperKey === "grid" ? "20px 20px" : undefined;
      return { backgroundImage: activeWallpaper.value, ...(bgSize ? { backgroundSize: bgSize } : {}) };
    }
    return {};
  };

  const toggleSection = (key: string) => setExpandedSection((prev) => (prev === key ? null : key));

  const handleApply = async () => {
    if (!user) return;
    setSaving(true);
    const prefs = { themeKey: selectedTheme, fontSize, fontKey, wallpaperKey, customWallpaperUrl };
    try {
      setGlobalPrefs(prefs);
      // Save to DB
      const { error } = await supabase.from("profiles").update({
        chat_theme_prefs: prefs as any,
      }).eq("id", user.id);
      if (error) throw error;
      toast.success("Chat theme applied!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, sectionKey }: { icon: any; title: string; sectionKey: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-body font-semibold">{title}</span>
      </div>
      {expandedSection === sectionKey ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">Chat Themes</h3>
      </div>

      {/* ── Live Preview ── */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-3 py-2 bg-secondary/50 border-b border-border">
          <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Live Preview</p>
        </div>
        <div
          className="p-3 space-y-2 min-h-[180px]"
          style={{
            backgroundColor: previewBg,
            fontFamily: activeFont?.family,
            fontSize: `${fontSize}px`,
            ...getWallpaperStyle(),
          }}
        >
          {previewMessages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.isSent ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2",
                  !activeTheme?.vars["--chat-bg"] && (msg.isSent ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"),
                  activeTheme?.vars["--chat-bg"] && (msg.isSent ? "rounded-br-md" : "rounded-bl-md")
                )}
                style={msg.isSent ? getSentStyle() : { backgroundColor: previewRecv, color: previewText }}
              >
                <p style={{ fontSize: `${fontSize}px`, fontFamily: activeFont?.family }}>{msg.content}</p>
                <p
                  className="text-[9px] mt-0.5 opacity-70"
                  style={{ color: msg.isSent ? undefined : previewMuted }}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Theme Selection ── */}
      <SectionHeader icon={Palette} title="Chat Theme" sectionKey="themes" />
      <AnimatePresence>
        {expandedSection === "themes" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pb-2">
              {chatThemes.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setSelectedTheme(theme.key)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl transition-all text-left",
                    selectedTheme === theme.key
                      ? "bg-primary/15 border-2 border-primary"
                      : "bg-secondary/50 border-2 border-transparent hover:border-primary/20"
                  )}
                >
                  <div className="flex gap-0.5 shrink-0">
                    {theme.colors.map((c, i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: c === "transparent" ? "var(--background)" : c }} />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-body font-semibold truncate">{theme.label}</p>
                    <p className="text-[9px] text-muted-foreground font-body truncate">{theme.preview}</p>
                  </div>
                  {selectedTheme === theme.key && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Font & Size ── */}
      <SectionHeader icon={Type} title="Font & Size" sectionKey="font" />
      <AnimatePresence>
        {expandedSection === "font" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-2">
              <div>
                <Label className="text-xs font-body text-muted-foreground mb-2 block">Font Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {fontOptions.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFontKey(f.key)}
                      className={cn(
                        "p-2.5 rounded-xl border-2 transition-all text-sm",
                        fontKey === f.key ? "border-primary bg-primary/10" : "border-border bg-secondary/50 hover:border-primary/20"
                      )}
                      style={{ fontFamily: f.family }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-body text-muted-foreground mb-2 block">Font Size: {fontSize}px</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([v]) => setFontSize(v)}
                  min={12}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Wallpaper ── */}
      <SectionHeader icon={ImageIcon} title="Chat Wallpaper" sectionKey="wallpaper" />
      <AnimatePresence>
        {expandedSection === "wallpaper" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-2">
              <div className="grid grid-cols-3 gap-2">
                {wallpapers.map((w) => (
                  <button
                    key={w.key}
                    onClick={() => { setWallpaperKey(w.key); setCustomWallpaperUrl(""); }}
                    className={cn(
                      "h-16 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-body font-medium",
                      wallpaperKey === w.key && !customWallpaperUrl
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:border-primary/20"
                    )}
                    style={w.value ? { backgroundImage: w.value, backgroundSize: w.key === "dots" || w.key === "grid" ? "20px 20px" : undefined } : {}}
                  >
                    {!w.value && w.label}
                  </button>
                ))}
              </div>
              <div>
                <Label className="text-xs font-body text-muted-foreground mb-1 block">Custom wallpaper URL</Label>
                <Input
                  value={customWallpaperUrl}
                  onChange={(e) => { setCustomWallpaperUrl(e.target.value); if (e.target.value) setWallpaperKey("none"); }}
                  placeholder="https://example.com/wallpaper.jpg"
                  className="bg-secondary border-0 font-body text-xs"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Apply Button ── */}
      <Button
        onClick={handleApply}
        disabled={saving}
        className="w-full gradient-primary border-0 text-primary-foreground font-body"
      >
        {saving ? "Applying..." : "Apply Chat Theme"}
      </Button>
    </div>
  );
};

export default ChatThemeSettings;
