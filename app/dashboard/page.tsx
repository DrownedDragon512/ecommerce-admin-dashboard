export default function DashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome to the admin dashboard.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>

        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Stock</h2>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>

        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Sales</h2>
          <p className="mt-2 text-2xl font-bold">₹0</p>
        </div>
      </div>
    </>
  );
}
