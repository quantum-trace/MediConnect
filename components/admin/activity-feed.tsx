"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, CheckCircle2, XCircle, Clock, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date-utils";
import type { ActivityItem } from "@/lib/services/analytics.service";

interface ActivityFeedProps {
  items: ActivityItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500/10 text-blue-500", icon: Video },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-rose-500/10 text-rose-500", icon: XCircle },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
    >
      <div className="border-b border-border/30 p-5">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Latest platform events</p>
      </div>

      <div className="divide-y divide-border/20 max-h-[480px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          items.map((item, i) => {
            const isPrescription = item.type === "prescription";
            const statusCfg = item.status ? STATUS_CONFIG[item.status] : null;
            const StatusIcon = statusCfg?.icon ?? CheckCircle2;

            return (
              <motion.div
                key={`${item.id}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-secondary/20"
              >
                {/* Icon */}
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    isPrescription
                      ? "bg-cyan-500/10"
                      : statusCfg
                      ? statusCfg.color.split(" ")[0]
                      : "bg-primary/10"
                  }`}
                >
                  {isPrescription ? (
                    <FileText className="h-4 w-4 text-cyan-500" />
                  ) : (
                    <StatusIcon
                      className={`h-4 w-4 ${statusCfg ? statusCfg.color.split(" ")[1] : "text-primary"}`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {isPrescription ? (
                      <>
                        <span className="text-foreground">{item.doctorName}</span>
                        <span className="text-muted-foreground"> issued prescription for </span>
                        <span className="text-foreground">{item.patientName}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-foreground">{item.patientName}</span>
                        <span className="text-muted-foreground"> booked with </span>
                        <span className="text-foreground">{item.doctorName}</span>
                      </>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(item.createdAt)}
                    </div>
                    {statusCfg && (
                      <Badge className={`h-4 rounded-md px-1.5 text-[10px] font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </Badge>
                    )}
                    {isPrescription && (
                      <Badge className="h-4 rounded-md bg-cyan-500/10 px-1.5 text-[10px] font-medium text-cyan-500">
                        Prescription
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
