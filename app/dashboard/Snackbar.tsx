"use client";

import { useEffect } from "react";

export type SnackbarType = "success" | "error" | "info";

type SnackbarProps = {
  message: string;
  type?: SnackbarType;
  onClose: () => void;
  durationMs?: number;
};

export function Snackbar({ message, type = "info", onClose, durationMs = 4000 }: SnackbarProps) {
  useEffect(() => {
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [onClose, durationMs]);

  const bg =
    type === "success"
      ? "bg-green-600/90 border-green-400"
      : type === "error"
        ? "bg-red-600/90 border-red-400"
        : "bg-slate-800/90 border-slate-600";

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className={`max-w-xl w-full rounded-md border text-white shadow-lg backdrop-blur ${bg}`}>
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="text-sm leading-5 flex-1">{message}</div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-white/80 hover:text-white focus:outline-none"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
