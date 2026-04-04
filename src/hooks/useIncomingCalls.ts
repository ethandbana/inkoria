import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IncomingCall {
  notificationId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string | null;
  callType: "audio" | "video";
  roomUrl: string;
}

export function useIncomingCalls(userId: string | undefined) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Listen for new call notifications in real-time
    const channel = supabase
      .channel("incoming-calls-" + userId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const notif = payload.new as any;
          if (notif.type !== "call" || !notif.link) return;

          // Fetch caller profile
          const { data: callerProfile } = await supabase
            .from("profiles")
            .select("display_name, username, avatar_url")
            .eq("id", notif.from_user_id)
            .single();

          const callType: "audio" | "video" = notif.title?.includes("Video") ? "video" : "audio";

          setIncomingCall({
            notificationId: notif.id,
            callerId: notif.from_user_id,
            callerName: callerProfile?.display_name || callerProfile?.username || "Someone",
            callerAvatar: callerProfile?.avatar_url || null,
            callType,
            roomUrl: notif.link,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const acceptCall = useCallback(() => {
    const call = incomingCall;
    setIncomingCall(null);
    return call;
  }, [incomingCall]);

  const declineCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return { incomingCall, acceptCall, declineCall };
}
