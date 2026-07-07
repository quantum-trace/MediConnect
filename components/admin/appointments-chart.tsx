"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TrendPoint } from "@/lib/services/analytics.service";

interface AppointmentsChartProps {
  data: TrendPoint[];
  days: number;
  onDaysChange: (days: number) => void;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/30 bg-card/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-muted-foreground">
          {p.dataKey === "appointments" ? "Total" : p.dataKey === "completed" ? "Completed" : "Cancelled"}:{" "}
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

const RANGE_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
];

export function AppointmentsChart({ data, days, onDaysChange }: AppointmentsChartProps) {
  const visibleData =
    days <= 14
      ? data
      : data.filter((_, i) => i % 3 === 0 || i === data.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-6 backdrop-blur-xl"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Appointments Over Time</h2>
          <p className="text-sm text-muted-foreground">Daily booking trends</p>
        </div>
        <div className="flex rounded-xl border border-border/30 bg-secondary/20 p-1 gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDaysChange(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                days === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cancelledGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={8}
              interval={days <= 14 ? 0 : "preserveStartEnd"}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) =>
                value === "appointments" ? "Total" : value === "completed" ? "Completed" : "Cancelled"
              }
              wrapperStyle={{ fontSize: 12 }}
            />
            <Area type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={2} fill="url(#totalGrad)" />
            <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="url(#completedGrad)" />
            <Area type="monotone" dataKey="cancelled" stroke="#f43f5e" strokeWidth={1.5} fill="url(#cancelledGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
