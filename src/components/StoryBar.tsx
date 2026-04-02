import { Plus, Circle, ImagePlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StoryBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [viewingStatus, setViewingStatus] = useState<any>(null);
  const statusInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOnline = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("is_online", true).limit(10);
      if (data) setOnlineUsers(data.filter((u) => u.id !== user?.id));
    };
    const fetchStatuses = async () => {
      const { data } = await supabase.from("statuses").select("*, profiles:user_id(username, display_name, avatar_url)").order("created_at", { ascending: false });
      if (data) setStatuses(data);
    };
    fetchOnline();
    fetchStatuses();
    const interval = setInterval(() => { fetchOnline(); fetchStatuses(); }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const uploadStatus = async (file: File) => {
    if (!user) return;
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/status_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("uploads").upload(filePath, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filePath);
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const { error } = await supabase.from("statuses").insert({ user_id: user.id, media_url: urlData.publicUrl, media_type: mediaType });
      if (error) throw error;
      toast.success("Status posted!");
    } catch (err: any) { toast.error(err.message); }
  };

  // Group statuses by user
  const statusUsers = new Map<string, any[]>();
  statuses.forEach((s) => {
    const existing = statusUsers.get(s.user_id) || [];
    existing.push(s);
    statusUsers.set(s.user_id, existing);
  });

  return (
    <>
      <div className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-hide">
        {user && (
          <button onClick={() => statusInputRef.current?.click()} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/40 bg-muted">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[11px] font-body text-muted-foreground truncate w-16 text-center">Status</span>
          </button>
        )}
        <input ref={statusInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadStatus(e.target.files[0])} />

        {/* Status users */}
        {Array.from(statusUsers.entries()).map(([uid, userStatuses]) => {
          const profile = (userStatuses[0] as any).profiles;
          const initial = (profile?.display_name || profile?.username || "?").charAt(0).toUpperCase();
          return (
            <button key={uid} onClick={() => setViewingStatus(userStatuses[0])} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-full p-0.5 gradient-primary relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
                ) : (
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center border-2 border-background">
                    <span className="text-lg font-display font-bold gradient-text">{initial}</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-body text-muted-foreground truncate w-16 text-center">{profile?.display_name || profile?.username || "User"}</span>
            </button>
          );
        })}

        {/* Online users without statuses */}
        {onlineUsers.filter(u => !statusUsers.has(u.id)).map((u) => {
          const initial = (u.display_name || u.username || "?").charAt(0).toUpperCase();
          return (
            <button key={u.id} onClick={() => navigate(`/user/${u.id}`)} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-muted-foreground/30 relative">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
                ) : (
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center border-2 border-background">
                    <span className="text-lg font-display font-bold gradient-text">{initial}</span>
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <span className="text-[11px] font-body text-muted-foreground truncate w-16 text-center">{u.display_name || u.username || "User"}</span>
            </button>
          );
        })}
      </div>

      {/* Status viewer modal */}
      {viewingStatus && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center" onClick={() => setViewingStatus(null)}>
          <div className="max-w-lg w-full max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              {(viewingStatus as any).profiles?.avatar_url ? (
                <img src={(viewingStatus as any).profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {((viewingStatus as any).profiles?.display_name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold font-body">{(viewingStatus as any).profiles?.display_name || "User"}</p>
                <p className="text-[10px] text-muted-foreground font-body">{new Date(viewingStatus.created_at).toLocaleTimeString()}</p>
              </div>
              <button onClick={() => setViewingStatus(null)} className="ml-auto text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            {viewingStatus.media_type === "image" ? (
              <img src={viewingStatus.media_url} alt="" className="w-full rounded-xl object-contain max-h-[70vh]" />
            ) : (
              <video src={viewingStatus.media_url} controls className="w-full rounded-xl max-h-[70vh]" />
            )}
            {viewingStatus.caption && <p className="text-sm font-body mt-3 text-center">{viewingStatus.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default StoryBar;
