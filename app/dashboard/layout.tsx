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
        <h2 className="text-xl font-bold text-green-400 mb-8">
          AdminPanel
        </h2>

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
        {children}
      </div>
    </div>
  );
}
