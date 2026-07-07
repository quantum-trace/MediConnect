"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, WifiOff, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VideoRoomProps {
  appointmentId: string;
  doctorName: string;
  patientName: string;
  role: "DOCTOR" | "PATIENT";
  timeSlot: string;
}

type RoomState = "loading" | "ready" | "error";

interface RoomData {
  roomUrl: string;
  roomName: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VideoRoom({
  appointmentId,
  doctorName,
  patientName,
  role,
  timeSlot,
}: VideoRoomProps) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [state, setState] = useState<RoomState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchRoom = useCallback(async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/video/room/${appointmentId}`);
      const data = await res.json() as { roomUrl?: string; roomName?: string; error?: string };

      if (!res.ok || !data.roomUrl) {
        throw new Error(data.error ?? "Could not load video room");
      }

      setRoom({ roomUrl: data.roomUrl, roomName: data.roomName ?? "" });
      setState("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error(`[VideoRoom] Failed to fetch room (attempt ${retryCount + 1}):`, message);
      setErrorMessage(message);
      setState("error");
    }
  }, [appointmentId, retryCount]);

  useEffect(() => {
    Promise.resolve().then(() => fetchRoom());
  }, [fetchRoom]);

  const handleRetry = () => setRetryCount((c) => c + 1);

  const isNetworkError =
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("available") ||
    errorMessage.toLowerCase().includes("provisioned");

  const counterparty = role === "DOCTOR" ? `Patient: ${patientName}` : `Doctor: ${doctorName}`;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0a0a0f]">
      <AnimatePresence mode="wait">

        {/* ── Loading ── */}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground"
          >
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Connecting to your consultation</p>
              <p className="mt-1 text-sm">
                {counterparty} · {timeSlot}
              </p>
              {retryCount > 0 && (
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Attempt {retryCount + 1}…
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
              {isNetworkError ? (
                <WifiOff className="h-7 w-7 text-destructive" />
              ) : (
                <AlertCircle className="h-7 w-7 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Unable to join</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-border/50"
                onClick={() => window.history.back()}
              >
                Go back
              </Button>
              <Button
                className="gap-2 rounded-xl"
                onClick={handleRetry}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Ready — Daily.co / Jitsi iframe ── */}
        {state === "ready" && room && (
          <motion.div
            key="call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 overflow-hidden"
          >
            <iframe
              ref={iframeRef}
              src={room.roomUrl}
              className="h-full w-full border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              title={`Video consultation — ${role === "DOCTOR" ? patientName : doctorName}`}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
