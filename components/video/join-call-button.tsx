"use client";

import { useRouter } from "next/navigation";
import { Video, PhoneOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface JoinCallButtonProps {
  appointmentId: string;
  status: string;
  consultationType: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  label?: string;
}

export function JoinCallButton({
  appointmentId,
  status,
  consultationType,
  className,
  variant = "default",
  size = "sm",
  label,
}: JoinCallButtonProps) {
  const router = useRouter();

  const isVideo = consultationType === "VIDEO";
  const isConfirmed = status === "CONFIRMED" || status === "COMPLETED";
  const canJoin = isVideo && isConfirmed;

  const disabledReason = !isVideo
    ? "In-person appointment"
    : status === "PENDING"
    ? "Awaiting approval"
    : status === "CANCELLED"
    ? "Appointment cancelled"
    : null;

  const button = (
    <Button
      variant={canJoin ? variant : "ghost"}
      size={size}
      disabled={!canJoin}
      onClick={() => canJoin && router.push(`/video/${appointmentId}`)}
      className={cn(
        "gap-1.5 transition-all min-w-0",
        canJoin && variant === "default" &&
          "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40",
        canJoin && variant === "outline" && "border-primary/40 text-primary hover:bg-primary/10",
        !canJoin && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {canJoin ? (
        <Video className="h-3.5 w-3.5 shrink-0" />
      ) : status === "CANCELLED" ? (
        <PhoneOff className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" />
      )}
      {size !== "icon" && (
        <span className="truncate min-w-0">
          {label ?? (canJoin ? "Join Call" : disabledReason ?? "Join Call")}
        </span>
      )}
    </Button>
  );

  if (!canJoin && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {disabledReason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
