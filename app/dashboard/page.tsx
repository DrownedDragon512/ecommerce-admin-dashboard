import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type Stats = {
  totalProducts: number;
  totalInventory: number;
  lowStockProducts: number;
  totalValue: number;
};

async function getStats(): Promise<Stats> {
  const db = await getDb();
  const products = await db.collection("products").find({}).toArray();

  const totalProducts = products.length;
  const totalInventory = products.reduce(
    (sum, product) => sum + (product.stock || 0),
    0
  );
  const lowStockProducts = products.filter(
    (product) => (product.stock || 0) < 10
  ).length;
  const totalValue = products.reduce(
    (sum, product) => sum + (product.price || 0) * (product.stock || 0),
    0
  );

  return {
    totalProducts,
    totalInventory,
    lowStockProducts,
    totalValue,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Products</div>
          <div className="text-3xl font-bold text-white">
            {stats.totalProducts}
          </div>
        </div>

        {/* Total Inventory */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Inventory</div>
          <div className="text-3xl font-bold text-white">
            {stats.totalInventory.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">units in stock</div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Low Stock Alert</div>
          <div className="text-3xl font-bold text-orange-400">
            {stats.lowStockProducts}
          </div>
          <div className="text-xs text-gray-500 mt-1">products &lt; 10 units</div>
        </div>

        {/* Total Value */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Inventory Value</div>
          <div className="text-3xl font-bold text-green-400">
            ₹{stats.totalValue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
