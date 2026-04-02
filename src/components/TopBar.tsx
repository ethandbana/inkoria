import { Bell, Moon, Sun, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TopBar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const channel = supabase.channel("notif-count")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <header className="sticky top-0 z-40 glass-surface border-b border-border/40">
      <div className="flex items-center justify-between h-[var(--nav-height)] px-4 max-w-4xl mx-auto">
        <motion.h1
          className="text-xl font-display font-bold"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="gradient-text">Inkoria</span>
        </motion.h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-secondary/80 transition-all duration-200">
            <motion.div
              key={isDark ? "sun" : "moon"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-secondary/80 transition-all duration-200" onClick={() => navigate("/notifications")}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                className="notification-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 transition-all duration-200">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-card border-border/40">
              <DropdownMenuItem onClick={() => navigate("/settings")} className="font-body text-sm cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")} className="font-body text-sm cursor-pointer">My Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")} className="font-body text-sm cursor-pointer">
                Notifications {unreadCount > 0 && <span className="ml-auto notification-badge relative text-[9px]">{unreadCount}</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuItem onClick={async () => { await signOut(); navigate("/auth"); }} className="font-body text-sm text-destructive cursor-pointer">Sign Out</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => navigate("/auth")} className="font-body text-sm cursor-pointer">Sign In</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
