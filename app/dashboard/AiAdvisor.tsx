"use client";

import { useEffect, useState } from "react";

type AiAdvisorProps = {
  summary: {
    totalProducts: number;
    totalInventory: number;
    totalSold: number;
    sellThrough: number;
    categoryStats: { category: string; stock: number; sold: number }[];
    topSelling: { name: string; sold: number; stock: number }[];
    lowStockList: { name: string; stock: number }[];
  };
};

export function AiAdvisor({ summary }: AiAdvisorProps) {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchAdvice = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      setAdvice(data.advice || "No advice returned.");
      if (!res.ok) {
        setError(data.error || "AI request failed");
      }
    } catch (err) {
      setError("Unable to fetch AI advice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">AI Advisor</div>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Refresh"}
        </button>
      </div>
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <div className="text-sm text-gray-200 whitespace-pre-wrap leading-6 min-h-[48px]">
        {loading && !advice ? "Loading advice..." : (
          <div>
            {(advice || "No advice yet.").split(/(\*\*[^*]+\*\*)/g).map((part, idx) => 
              part.startsWith("**") && part.endsWith("**") ? 
                <span key={idx} className="font-bold text-white">{part.slice(2, -2)}</span> :
                <span key={idx}>{part}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
