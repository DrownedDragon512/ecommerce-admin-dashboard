"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

type RevenueCategoryChartProps = {
  categoryStats: { category: string; stock: number; sold: number; value: number }[];
};

const COLORS = [
  "#3fb950", // green
  "#58a6ff", // blue
  "#a371f7", // purple
  "#d29922", // gold
  "#f85149", // red
  "#1f6feb", // accent blue
  "#8b949e", // muted gray
  "#79c0ff", // light blue
];

export function RevenueCategoryChart({ categoryStats }: RevenueCategoryChartProps) {
  if (categoryStats.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-4">Revenue by Category</div>
        <div className="text-sm text-gray-500">No category data yet.</div>
      </div>
    );
  }

  const chartData = categoryStats.map((cat) => ({
    name: cat.category || "Others",
    value: cat.value,
    stock: cat.stock,
    sold: cat.sold,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-gray-200">
          <p className="font-semibold text-white">{data.name}</p>
          <p>Revenue: ₹{data.value.toLocaleString()}</p>
          <p>Stock: {data.stock} · Sold: {data.sold}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">Revenue by Category</div>
        <div className="text-xs text-gray-500">Donut distribution</div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#c9d1d9" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
