"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SalesTrendPoint = {
  date: string;
  units: number;
  revenue: number;
};

type SalesTrendChartProps = {
  salesTrend7: SalesTrendPoint[];
  salesTrend30: SalesTrendPoint[];
};

export function SalesTrendChart({ salesTrend7, salesTrend30 }: SalesTrendChartProps) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const data = range === "7d" ? salesTrend7 : salesTrend30;

  const hasData = useMemo(
    () => data.some((p) => (p.units ?? 0) > 0 || (p.revenue ?? 0) > 0),
    [data]
  );

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400">Sales Trend</div>
          <div className="text-xs text-gray-500">Last 7 / 30 days</div>
        </div>
        <div className="flex gap-2 text-xs">
          {(["7d", "30d"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={
                "px-3 py-1 rounded border transition-colors " +
                (range === option
                  ? "border-emerald-400 bg-emerald-400/10 text-white"
                  : "border-slate-700 text-gray-400 hover:border-slate-500")
              }
            >
              {option === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="h-72 flex items-center justify-center bg-slate-900/40 rounded border border-dashed border-slate-700 text-sm text-gray-500">
          No recent sales recorded yet.
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                tickFormatter={(v) => `₹${Number(v).toLocaleString()}`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  color: "#c9d1d9",
                }}
                formatter={(value, name, props) => {
                  const key = (props as any)?.dataKey || name;
                  if (key === "revenue") {
                    return [`₹${Number(value).toLocaleString()}`, "Revenue"];
                  }
                  return [Number(value).toLocaleString(), "Units"];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />

              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#3fb950"
                strokeWidth={2}
                fill="#3fb95033"
                name="Revenue (₹)"
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="units"
                stroke="#58a6ff"
                strokeWidth={2}
                dot={{ r: 3, fill: "#58a6ff" }}
                activeDot={{ r: 5 }}
                name="Units Sold"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
