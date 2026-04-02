import Layout from "@/components/Layout";
import { Bell, BookOpen, Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  book_published: BookOpen,
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  tag: Bell,
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setNotifications(data);
    };
    fetch();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
          <p className="text-muted-foreground font-body">Sign in to view notifications</p>
          <Button onClick={() => navigate("/auth")} className="gradient-primary border-0 text-primary-foreground font-body">Sign In</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold">Notifications</h2>
          {notifications.some(n => !n.is_read) && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs font-body gap-1">
              <Check className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-body">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (n.link) navigate(n.link);
                    if (!n.is_read) {
                      supabase.from("notifications").update({ is_read: true }).eq("id", n.id).then();
                      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                    }
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left",
                    n.is_read ? "hover:bg-secondary" : "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", n.is_read ? "bg-secondary" : "gradient-primary")}>
                    <Icon className={cn("w-4 h-4", n.is_read ? "text-muted-foreground" : "text-primary-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-body", !n.is_read && "font-semibold")}>{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-2">{n.body}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-body shrink-0">{formatTime(n.created_at)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
