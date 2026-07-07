"use client";

import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Heart,
  Droplets,
  Scale,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

const healthData = [
  { day: "Mon", heartRate: 72, bloodPressure: 120, weight: 165 },
  { day: "Tue", heartRate: 75, bloodPressure: 118, weight: 165 },
  { day: "Wed", heartRate: 70, bloodPressure: 122, weight: 164 },
  { day: "Thu", heartRate: 73, bloodPressure: 119, weight: 164 },
  { day: "Fri", heartRate: 71, bloodPressure: 121, weight: 163 },
  { day: "Sat", heartRate: 68, bloodPressure: 117, weight: 163 },
  { day: "Sun", heartRate: 72, bloodPressure: 120, weight: 163 },
];

const metrics = [
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    change: "-3%",
    trend: "down",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    label: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    change: "Normal",
    trend: "stable",
    icon: Activity,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Blood Glucose",
    value: "95",
    unit: "mg/dL",
    change: "+2%",
    trend: "up",
    icon: Droplets,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Weight",
    value: "163",
    unit: "lbs",
    change: "-2 lbs",
    trend: "down",
    icon: Scale,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export function HealthAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Health Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Your weekly health trends
            </p>
          </div>
        </div>
        <select className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="rounded-xl border border-border/50 bg-secondary/20 p-3"
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  metric.bgColor
                )}
              >
                <metric.icon className={cn("h-4 w-4", metric.color)} />
              </div>
              <span className="text-xs text-muted-foreground">
                {metric.label}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{metric.value}</span>
                <span className="text-xs text-muted-foreground">
                  {metric.unit}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" && (
                  <TrendingUp className="h-3 w-3 text-rose-500" />
                )}
                {metric.trend === "down" && (
                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                )}
                <span
                  className={cn(
                    metric.trend === "up" && "text-rose-500",
                    metric.trend === "down" && "text-emerald-500",
                    metric.trend === "stable" && "text-muted-foreground"
                  )}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
          <h4 className="mb-4 text-sm font-medium text-muted-foreground">
            Heart Rate Trend
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData}>
                <defs>
                  <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  domain={[60, 85]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#heartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
