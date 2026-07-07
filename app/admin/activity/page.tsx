"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Video,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminHeader } from "@/components/admin/header";
import { formatDate, formatTime } from "@/lib/date-utils";
import { toast } from "sonner";
import type { ActivityItem } from "@/lib/services/analytics.service";

const ACTIVITY_LIMIT = 50;

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500/10 text-blue-500", icon: Video },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-rose-500/10 text-rose-500", icon: XCircle },
};

const TYPE_FILTERS = [
  { label: "All Activity", value: "all" },
  { label: "Appointments", value: "appointment" },
  { label: "Prescriptions", value: "prescription" },
] as const;

type TypeFilter = "all" | "appointment" | "prescription";

export default function AdminActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const fetchActivity = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/analytics?trendDays=30&revenueMonths=1&activityLimit=${ACTIVITY_LIMIT}&doctorLimit=5`
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setItems(data.recentActivity ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load activity.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    Promise.resolve().then(() => fetchActivity());
  }, [fetchActivity]);

  const filtered = items.filter((item) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const lowerSearch = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.patientName?.toLowerCase().includes(lowerSearch) ||
      item.doctorName?.toLowerCase().includes(lowerSearch);
    return matchesType && matchesSearch;
  });

  const stats = [
    {
      label: "Total Events",
      value: items.length,
      color: "text-foreground",
    },
    {
      label: "Appointments",
      value: items.filter((i) => i.type === "appointment").length,
      color: "text-primary",
    },
    {
      label: "Prescriptions",
      value: items.filter((i) => i.type === "prescription").length,
      color: "text-cyan-500",
    },
    {
      label: "Completed",
      value: items.filter((i) => i.status === "COMPLETED").length,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader title="Activity Log" subtitle="Real-time platform event stream" />
      <main className="p-6 lg:p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-5 backdrop-blur-xl"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient or doctor..."
                className="h-9 rounded-xl border-border/30 bg-secondary/30 pl-9 text-sm"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 cursor-pointer rounded-xl border-border/30 gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {TYPE_FILTERS.find((f) => f.value === typeFilter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border-border/30 bg-card/95 backdrop-blur-xl"
              >
                {TYPE_FILTERS.map((f) => (
                  <DropdownMenuItem
                    key={f.value}
                    onClick={() => setTypeFilter(f.value as TypeFilter)}
                    className={`cursor-pointer ${typeFilter === f.value ? "text-primary font-medium" : ""}`}
                  >
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivity(true)}
            disabled={refreshing}
            className="h-9 cursor-pointer rounded-xl border-border/30 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
        >
          <div className="border-b border-border/30 p-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
              <Activity className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Event Stream</h2>
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {items.length} events
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
                <Activity className="h-8 w-8 text-rose-500/60" />
              </div>
              <p className="font-medium text-muted-foreground">No activity found</p>
              <p className="text-sm text-muted-foreground/60">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {filtered.map((item, i) => {
                const isPrescription = item.type === "prescription";
                const statusCfg = item.status ? STATUS_CONFIG[item.status] : null;
                const StatusIcon = statusCfg?.icon ?? CheckCircle2;

                return (
                  <motion.div
                    key={`${item.id}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="flex items-start gap-4 p-4 transition-colors hover:bg-secondary/20"
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                        isPrescription
                          ? "bg-cyan-500/10"
                          : statusCfg
                          ? statusCfg.color.split(" ")[0]
                          : "bg-primary/10"
                      }`}
                    >
                      {isPrescription ? (
                        <FileText className="h-4.5 w-4.5 text-cyan-500" />
                      ) : (
                        <StatusIcon
                          className={`h-4.5 w-4.5 ${
                            statusCfg ? statusCfg.color.split(" ")[1] : "text-primary"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {isPrescription ? (
                          <>
                            <span className="text-foreground">{item.doctorName}</span>
                            <span className="text-muted-foreground"> issued a prescription for </span>
                            <span className="text-foreground">{item.patientName}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-foreground">{item.patientName}</span>
                            <span className="text-muted-foreground"> booked an appointment with </span>
                            <span className="text-foreground">{item.doctorName}</span>
                          </>
                        )}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
                        </div>
                        {statusCfg && (
                          <Badge
                            className={`h-4 rounded-md px-1.5 text-[10px] font-medium ${statusCfg.color}`}
                          >
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
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
