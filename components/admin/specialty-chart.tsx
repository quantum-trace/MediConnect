"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SpecialtyCount } from "@/lib/services/analytics.service";

interface SpecialtyChartProps {
  data: SpecialtyCount[];
}

const COLORS = [
  "var(--primary)",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#6366f1",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: SpecialtyCount }>;
}) {
  if (!active || !payload?.length) return null;
  const { specialty, count } = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/30 bg-card/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-semibold">{specialty}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Appointments: <span className="font-semibold text-foreground">{count}</span>
      </p>
    </div>
  );
}

export function SpecialtyChart({ data }: SpecialtyChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-6 backdrop-blur-xl"
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold">Specialty Distribution</h2>
        <p className="text-sm text-muted-foreground">Appointments by medical specialty</p>
      </div>

      {total === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No appointment data yet
        </div>
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="specialty"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {data.slice(0, 5).map((item, index) => (
              <div key={item.specialty} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate max-w-[120px]">
                    {item.specialty}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="font-semibold">{item.count}</span>
                  <span className="text-muted-foreground/60">
                    ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
