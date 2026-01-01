export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
