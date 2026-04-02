import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Palette, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme, AppTheme } from "@/hooks/use-theme";
import ChatThemeSettings from "@/components/chat/ChatThemeSettings";

const allGenres = ["Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Poetry", "Non-Fiction", "Young Adult", "Thriller", "Drama", "History", "Biography"];

const themeOptions: { key: AppTheme; label: string; colors: string[] }[] = [
  { key: "dark", label: "Dark", colors: ["#1a1a1a", "#e8813a", "#db4b72"] },
  { key: "light", label: "Light", colors: ["#f5f0eb", "#e8813a", "#db4b72"] },
  { key: "midnight", label: "Midnight", colors: ["#0f172a", "#6366f1", "#818cf8"] },
  { key: "forest", label: "Forest", colors: ["#0f1f0f", "#22c55e", "#4ade80"] },
  { key: "sunset", label: "Sunset", colors: ["#fef3e2", "#f97316", "#ef4444"] },
  { key: "ocean", label: "Ocean", colors: ["#0c1929", "#0ea5e9", "#38bdf8"] },
  { key: "rose", label: "Rosé", colors: ["#fdf2f8", "#ec4899", "#f472b6"] },
  { key: "zinator", label: "Dark Zinator", colors: ["#0a0a0a", "#00ff00", "#00cc66"] },
  { key: "cyberpunk", label: "Cyberpunk", colors: ["#12001a", "#cc44ff", "#ff3399"] },
  { key: "bloodred", label: "Blood Red", colors: ["#1a0505", "#cc1a1a", "#e06030"] },
  { key: "ice", label: "Ice", colors: ["#f0f7ff", "#0099ff", "#00b3a4"] },
  { key: "gold", label: "Gold Luxury", colors: ["#1a1400", "#e6a817", "#cc7722"] },
  { key: "transparent", label: "Glass", colors: ["#1a1a2e", "#3366cc", "#7744cc"] },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setGenres(data.favorite_genres || []);
      }
    };
    fetchProfile();
  }, [user]);

  const uploadImage = async (file: File, path: string) => {
    const ext = file.name.split(".").pop();
    const filePath = `${user!.id}/${path}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "avatar");
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user!.id);
      setProfile((p: any) => ({ ...p, avatar_url: url }));
      toast.success("Avatar updated!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "background");
      await supabase.from("profiles").update({ background_image_url: url }).eq("id", user!.id);
      setProfile((p: any) => ({ ...p, background_image_url: url }));
      toast.success("Background updated!");
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleGenre = (g: string) => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        display_name: displayName, username, bio, favorite_genres: genres, updated_at: new Date().toISOString(),
      }).eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (!profile) return null;

  const initial = (displayName || username || "?").charAt(0).toUpperCase();

  return (
    <Layout>
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-display font-semibold">Settings</h2>
        </div>

        {/* Background image */}
        <div className="relative">
          <button onClick={() => bgRef.current?.click()} className="w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
            {profile.background_image_url ? (
              <img src={profile.background_image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground"><Camera className="w-6 h-6" /><span className="text-xs font-body">Add Background</span></div>
            )}
          </button>
          <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-12 relative z-10">
          <button onClick={() => avatarRef.current?.click()} className="relative group">
            <div className="w-24 h-24 rounded-full gradient-primary p-0.5">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-3xl font-display font-bold gradient-text">{initial}</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-0 font-body" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary border-0 font-body" />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-1 block">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-md bg-secondary border-0 font-body text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Tell us about yourself..." />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground mb-2 block">Favorite Genres</label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((g) => (
                <button key={g} onClick={() => toggleGenre(g)} className={cn("px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors", genres.includes(g) ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{g}</button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="text-xs font-body text-muted-foreground mb-2 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> App Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {themeOptions.map((t) => (
                <button key={t.key} onClick={() => setTheme(t.key)} className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all", theme === t.key ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/30")}>
                  <div className="flex gap-1">
                    {t.colors.map((c, i) => (<div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />))}
                  </div>
                  <span className="text-[10px] font-body font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Themes */}
          <div className="pt-2 border-t border-border">
            <ChatThemeSettings />
          </div>
        </div>

        <Button onClick={saveProfile} disabled={saving} className="w-full gradient-primary border-0 text-primary-foreground font-body">
          {saving ? "Saving..." : "Save Profile"}
        </Button>

        <Button variant="outline" onClick={async () => { await signOut(); navigate("/auth"); }} className="w-full gap-2 font-body text-destructive border-destructive/30 hover:bg-destructive/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </Layout>
  );
};

export default Settings;
