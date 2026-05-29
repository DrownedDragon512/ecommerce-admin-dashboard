"use client";

import { useEffect, useRef, useState } from "react";

type Stats = {
  totalProducts: number;
  totalInventory: number;
  lowStockProducts: number;
  totalValue: number;
  totalSold: number;
  totalIntake: number;
};

type CountUpNumberProps = {
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const CountUpNumber = ({
  value,
  duration = 1400, // was 900
  formatter,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpNumberProps) => {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    start.current = null;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    let raf: number;
    const step = (ts: number) => {
      if (start.current === null) start.current = ts;
      const progress = Math.min(1, (ts - start.current) / duration);
      const eased = easeOutQuart(progress);
      const next = value * eased;
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const text = formatter
    ? formatter(display)
    : Math.round(display).toLocaleString();

  return <span className={className}>{`${prefix}${text}${suffix}`}</span>;
};

export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-2">Total Products</div>
        <CountUpNumber
          value={stats.totalProducts}
          className="text-3xl font-bold text-white block"
        />
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-2">Total Sold</div>
        <CountUpNumber
          value={stats.totalSold}
          className="text-3xl font-bold text-green-400 block"
        />
        <div className="text-xs text-gray-500 mt-1">units sold</div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-2">Total Value Sold</div>
        <CountUpNumber
          value={stats.totalIntake}
          prefix="₹"
          formatter={(v) => Math.round(v).toLocaleString()}
          className="text-3xl font-bold text-blue-400 block"
        />
        <div className="text-xs text-gray-500 mt-1">revenue from sales</div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-2">Current Inventory</div>
        <CountUpNumber
          value={stats.totalInventory}
          formatter={(v) => Math.round(v).toLocaleString()}
          className="text-3xl font-bold text-white block"
        />
        <div className="text-xs text-gray-500 mt-1">units in stock</div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-2">Low Stock Alert</div>
        <CountUpNumber
          value={stats.lowStockProducts}
          className="text-3xl font-bold text-orange-400 block"
        />
        <div className="text-xs text-gray-500 mt-1">products &lt; 10 units</div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-sm text-gray-400 mb-2">Inventory Value</div>
        <CountUpNumber
          value={stats.totalValue}
          prefix="₹"
          formatter={(v) => Math.round(v).toLocaleString()}
          className="text-3xl font-bold text-purple-400 block"
        />
      </div>
    </div>
  );
}