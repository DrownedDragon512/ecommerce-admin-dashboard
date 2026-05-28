"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";

type CategoryStat = {
  category: string;
  stock: number;
  sold: number;
};

type ProductStat = {
  name: string;
  sold?: number; // Optional since lowStockList doesn't strictly require it
  stock: number;
};

type AiAdvisorProps = {
  summary: {
    totalProducts: number;
    totalInventory: number;
    totalSold: number;
    sellThrough: number;
    categoryStats: CategoryStat[];
    topSelling: ProductStat[];
    lowStockList: ProductStat[];
  };
};

// Extracted utility function for handling markdown-style bold text
const formatAdviceText = (text: string): ReactNode[] => {
  if (!text) return [<span key="empty">No advice yet.</span>];
  
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={idx} className="font-bold text-white">
        {part.slice(2, -2)}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
};

export function AiAdvisor({ summary }: AiAdvisorProps) {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // useCallback prevents unnecessary re-renders and allows safe inclusion in useEffect
  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "AI request failed");
      }
      
      setAdvice(data.advice || "No advice returned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch AI advice");
    } finally {
      setLoading(false);
    }
  }, [summary]); // Safely captures summary updates

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-gray-400">AI Advisor</h2>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          aria-busy={loading}
          className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 transition-colors"
        >
          {loading ? "Thinking..." : "Refresh"}
        </button>
      </header>
      
      {error && (
        <div role="alert" className="text-xs text-red-400 mb-2">
          {error}
        </div>
      )}
      
      <div className="text-sm text-gray-200 whitespace-pre-wrap leading-6 min-h-12">
        {loading && !advice ? (
          "Loading advice..."
        ) : (
          <div>{formatAdviceText(advice)}</div>
        )}
      </div>
    </div>
  );
}