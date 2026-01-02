"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] p-6">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800"
          />
          <h2 className="text-xl font-bold text-green-400">
            Your Panel
          </h2>
        </div>

        <nav className="space-y-3 text-sm">
          <a
            href="/dashboard"
            className="block rounded px-3 py-2 hover:bg-slate-800"
          >
            Dashboard
          </a>

          <a
            href="/dashboard/products"
            className="block rounded px-3 py-2 hover:bg-slate-800"
          >
            Products
          </a>

          <a
            href="/dashboard/products/new"
            className="block rounded px-3 py-2 hover:bg-slate-800"
          >
            Add Product
          </a>

          <button
            onClick={handleLogout}
            className="block w-full text-left rounded px-3 py-2 hover:bg-slate-800 text-red-400 mt-8"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-[#0f172a]/80 px-6 py-4 sticky top-0 z-10 backdrop-blur">
          <div>
            <div className="text-xs text-gray-500">Dashboard</div>
            <div className="text-base font-semibold text-white">Overview</div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard/profile"
              className="relative h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-semibold shadow-lg hover:scale-105 transition"
              title="Profile"
            >
              <span className="sr-only">Profile</span>
              P
            </a>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
