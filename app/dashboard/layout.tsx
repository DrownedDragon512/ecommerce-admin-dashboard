export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-6">
          Admin Panel
        </h2>

        <nav className="space-y-3">
          <a
            href="/dashboard"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Dashboard
          </a>

          <a
            href="/dashboard/products"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Products
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
