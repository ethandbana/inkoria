import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WebRTCCall {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  callType: "audio" | "video";
  direction: "outgoing" | "incoming";
}

interface SignalPayload {
  type: "offer" | "answer" | "ice-candidate" | "call-request" | "call-end" | "call-decline";
  from: string;
  fromName?: string;
  fromAvatar?: string | null;
  callType?: "audio" | "video";
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export function useWebRTC(userId: string | undefined, userDisplayName?: string, userAvatar?: string | null) {
  const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected">("idle");
  const [activeCall, setActiveCall] = useState<WebRTCCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<WebRTCCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  // Set up the signaling channel
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`webrtc-signal-${userId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "signal" }, async ({ payload }: { payload: SignalPayload }) => {
      if (!payload || payload.from === userId) return;

      switch (payload.type) {
        case "call-request":
          setIncomingCall({
            partnerId: payload.from,
            partnerName: payload.fromName || "Unknown",
            partnerAvatar: payload.fromAvatar || null,
            callType: payload.callType || "audio",
            direction: "incoming",
          });
          if (payload.offer) {
            pendingOfferRef.current = payload.offer;
          }
          setCallState("ringing");
          break;

        case "answer":
          if (peerConnectionRef.current && payload.answer) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(payload.answer)
            );
            setCallState("connected");
          }
          break;

        case "ice-candidate":
          if (peerConnectionRef.current && payload.candidate) {
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(payload.candidate)
              );
            } catch (e) {
              console.error("Error adding ICE candidate:", e);
            }
          }
          break;

        case "call-end":
        case "call-decline":
          cleanup();
          break;
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const sendSignal = useCallback(
    (targetUserId: string, payload: Omit<SignalPayload, "from">) => {
      const targetChannel = supabase.channel(`webrtc-signal-${targetUserId}`, {
        config: { broadcast: { self: false } },
      });
      targetChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          targetChannel.send({
            type: "broadcast",
            event: "signal",
            payload: { ...payload, from: userId! } as SignalPayload,
          });
          // Unsubscribe after a short delay to allow message delivery
          setTimeout(() => supabase.removeChannel(targetChannel), 2000);
        }
      });
    },
    [userId]
  );

  const createPeerConnection = useCallback(
    (partnerId: string) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(partnerId, {
            type: "ice-candidate",
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          cleanup();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [sendSignal]
  );

  const startCall = useCallback(
    async (partnerId: string, partnerName: string, partnerAvatar: string | null, callType: "audio" | "video") => {
      if (!userId) return;

      try {
        const constraints: MediaStreamConstraints =
          callType === "audio" ? { audio: true, video: false } : { audio: true, video: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = createPeerConnection(partnerId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        setActiveCall({
          partnerId,
          partnerName,
          partnerAvatar,
          callType,
          direction: "outgoing",
        });
        setCallState("calling");

        sendSignal(partnerId, {
          type: "call-request",
          fromName: userDisplayName,
          fromAvatar: userAvatar,
          callType,
          offer,
        });
      } catch (error) {
        console.error("Error starting call:", error);
        cleanup();
      }
    },
    [userId, userDisplayName, userAvatar, createPeerConnection, sendSignal]
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !pendingOfferRef.current) return;

    try {
      const callType = incomingCall.callType;
      const constraints: MediaStreamConstraints =
        callType === "audio" ? { audio: true, video: false } : { audio: true, video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(incomingCall.partnerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSignal(incomingCall.partnerId, { type: "answer", answer });

      setActiveCall(incomingCall);
      setCallState("connected");
      setIncomingCall(null);
      pendingOfferRef.current = null;
    } catch (error) {
      console.error("Error accepting call:", error);
      cleanup();
    }
  }, [incomingCall, createPeerConnection, sendSignal]);

  const declineCall = useCallback(() => {
    if (incomingCall) {
      sendSignal(incomingCall.partnerId, { type: "call-decline" });
    }
    setIncomingCall(null);
    pendingOfferRef.current = null;
    setCallState("idle");
  }, [incomingCall, sendSignal]);

  const endCall = useCallback(() => {
    if (activeCall) {
      sendSignal(activeCall.partnerId, { type: "call-end" });
    }
    cleanup();
  }, [activeCall, sendSignal]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setActiveCall(null);
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
    pendingOfferRef.current = null;
  }, []);

  return {
    callState,
    activeCall,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
