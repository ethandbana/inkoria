import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updatePresence = async (online: boolean) => {
      await supabase
        .from("profiles")
        .update({ is_online: online, last_seen: new Date().toISOString() })
        .eq("id", user.id);
    };

    updatePresence(true);

    const interval = setInterval(() => updatePresence(true), 60000);

    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    const handleBeforeUnload = () => {
      navigator.sendBeacon && updatePresence(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updatePresence(false);
    };
  }, [user]);
};
