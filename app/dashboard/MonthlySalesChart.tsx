"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type MonthlySalesChartProps = {
  data: { month: string; sales: number; units: number }[];
};

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-slate-900/40 rounded border border-slate-700">
        <div className="text-sm text-gray-500">No sales data for this year yet.</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "6px",
            color: "#f1f5f9",
          }}
          labelStyle={{ color: "#cbd5e1" }}
        />
        <Legend wrapperStyle={{ color: "#9ca3af" }} />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
          name="Sales (₹)"
        />
        <Line
          type="monotone"
          dataKey="units"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
          name="Units Sold"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
