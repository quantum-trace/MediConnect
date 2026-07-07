"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Data fetched dynamically

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/30 bg-card/95 p-4 shadow-xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            Earnings:{" "}
            <span className="font-semibold text-primary">
              ₹{payload[0]?.value?.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function EarningsAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("This Year");

  useEffect(() => {
    async function fetchEarnings() {
      try {
        setLoading(true);
        const res = await fetch(`/api/doctor/earnings?timeframe=${encodeURIComponent(timeframe)}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchEarnings();
  }, [timeframe]);

  const chartData = data?.chartData || [];
  const dynamicRecentConsultations = data?.recentConsultations || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalEarnings = chartData.reduce((sum: number, item: any) => sum + item.earnings, 0);
  const currentMonthEarnings = chartData.length > 0 ? chartData[chartData.length - 1].earnings : 0;
  const lastMonthEarnings = chartData.length > 1 ? chartData[chartData.length - 2].earnings : 0;
  const growthPercentage = lastMonthEarnings > 0 
    ? (((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1)
    : currentMonthEarnings > 0 ? "100.0" : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Earnings Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your revenue and payment history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl border-border/30 cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                {timeframe}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/30">
              <DropdownMenuItem onClick={() => setTimeframe("This Week")} className="cursor-pointer">This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeframe("This Month")} className="cursor-pointer">This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeframe("This Year")} className="cursor-pointer">This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x lg:divide-border/20">
        {/* Chart Section */}
        <div className="lg:col-span-2 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                This Month
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-bold">
                  ₹{currentMonthEarnings.toLocaleString()}
                </span>
                <Badge className="h-5 rounded-md bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-500">
                  <Activity className="mr-0.5 h-3 w-3" />
                  {growthPercentage}%
                </Badge>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 p-4 border border-accent/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 text-accent" />
                YTD Total
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">
                  ₹{totalEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="p-6 border-t border-border/20 lg:border-t-0">
          <h3 className="text-sm font-semibold mb-4">Recent Consultations</h3>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {dynamicRecentConsultations.map((consultation: any) => (
              <div
                key={consultation.id}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{consultation.patient}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {consultation.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-500">
                    +₹{consultation.fee}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {consultation.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4 justify-center rounded-xl text-sm font-medium text-primary hover:bg-primary/10 cursor-pointer"
            asChild
          >
            <Link href="/doctor/appointments">
              View All Consultations
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
