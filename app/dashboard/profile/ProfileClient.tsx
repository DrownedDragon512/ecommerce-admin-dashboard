"use client";

import { useEffect, useState } from "react";

type ProfileClientProps = {
  initialName: string;
  email: string;
  userId: string;
};

export function ProfileClient({ initialName, email, userId }: ProfileClientProps) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("profile-display-name") : null;
    if (saved) {
      setName(saved);
    }
  }, []);

  const handleSave = () => {
    setStatus("saved");
    if (typeof window !== "undefined") {
      localStorage.setItem("profile-display-name", name);
    }
    setTimeout(() => setStatus("idle"), 1200);
  };

  const displayInitial = (name || initialName || "A").charAt(0).toUpperCase();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 text-sm">Manage your account info</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-linear-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-semibold">
              {displayInitial}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{name}</div>
              <div className="text-sm text-gray-400">{email}</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">User ID: <span className="text-gray-200">{userId}</span></div>

          <div className="pt-4 space-y-2">
            <label className="block text-sm text-gray-300">Display name</label>
            <input
              className="w-full rounded bg-slate-700 border border-slate-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className="btn-save rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Save
              </button>
              {status === "saved" && (
                <span className="saved-chip text-[11px] font-semibold text-emerald-200 bg-emerald-900/50 border border-emerald-500/40 rounded-full px-3 py-1">
                  Saved locally
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">(Display name is stored locally in this browser.)</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .btn-save {
          transition: transform 150ms ease, box-shadow 200ms ease;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.18);
        }
        .btn-save:hover {
          transform: translateY(-1px) scale(1.04);
          box-shadow: 0 8px 22px rgba(16, 185, 129, 0.28);
        }
        .btn-save:active {
          transform: translateY(0) scale(0.97);
          box-shadow: 0 3px 10px rgba(16, 185, 129, 0.24);
        }
        .saved-chip {
          animation: pop-in 150ms ease, pulse 1.2s ease-in-out 0.15s infinite;
        }
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
}
