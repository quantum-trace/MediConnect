"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IndianRupee, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RevenuePoint } from "@/lib/services/analytics.service";

interface RevenueChartProps {
  data: RevenuePoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/30 bg-card/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="mb-1.5 text-xs font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">
        Revenue:{" "}
        <span className="font-semibold text-amber-500">
          ₹{payload[0]?.value?.toLocaleString()}
        </span>
      </p>
      {payload[1] && (
        <p className="text-xs text-muted-foreground">
          Appointments: <span className="font-semibold text-primary">{payload[1].value}</span>
        </p>
      )}
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const lastTwo = data.slice(-2);
  const growth =
    lastTwo.length === 2 && lastTwo[0].revenue > 0
      ? (((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) * 100).toFixed(1)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-6 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Revenue Trends</h2>
          <p className="text-sm text-muted-foreground">Monthly revenue from completed appointments</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-2xl font-bold">
            <IndianRupee className="h-5 w-5 text-amber-500" />
            {totalRevenue >= 1_000 ? `${(totalRevenue / 1_000).toFixed(1)}K` : totalRevenue}
          </div>
          {growth !== null && (
            <Badge className="mt-1 h-5 rounded-md bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-500">
              <TrendingUp className="mr-0.5 h-3 w-3" />
              {growth}% MoM
            </Badge>
          )}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
            <defs>
              <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `₹${v / 1000}k` : `₹${v}`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="url(#revenueBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
