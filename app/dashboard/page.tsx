import { getDb } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { AiAdvisor } from "./AiAdvisor";
import { MonthlySalesChart } from "./MonthlySalesChart";
import { RevenueCategoryChart } from "./RevenueCategoryChart";

export const dynamic = "force-dynamic";

type Stats = {
  totalProducts: number;
  totalInventory: number;
  lowStockProducts: number;
  totalValue: number;
  totalSold: number;
  totalIntake: number;
  categoryStats: CategoryStat[];
  topSelling: ProductStat[];
  lowStockList: ProductStat[];
  sellThrough: number;
  monthlySales: MonthlySalesData[];
};

type MonthlySalesData = {
  month: string;
  sales: number;
  units: number;
};

type CategoryStat = {
  category: string;
  stock: number;
  sold: number;
  value: number;
};

type ProductStat = {
  name: string;
  stock: number;
  sold: number;
  value: number;
};

async function getStats(): Promise<Stats> {
  const user = await getAuthUser();
  if (!user) {
    return {
      totalProducts: 0,
      totalInventory: 0,
      lowStockProducts: 0,
      totalValue: 0,
      totalSold: 0,
      totalIntake: 0,
      categoryStats: [],
      topSelling: [],
      lowStockList: [],
      sellThrough: 0,
      monthlySales: [],
    };
  }

  const db = await getDb();
  const products = await db
    .collection("products")
    .find({ userId: user.userId })
    .toArray();

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
  const totalSold = products.reduce(
    (sum, product) => sum + (product.sold || 0),
    0
  );
  const totalIntake = products.reduce(
    (sum, product) => sum + (product.totalIntake || 0),
    0
  );

  const categoryMap = new Map<string, CategoryStat>();
  for (const p of products) {
    const catName = p.category || "Others";
    const current = categoryMap.get(catName) || {
      category: catName,
      stock: 0,
      sold: 0,
      value: 0,
    };
    current.stock += p.stock || 0;
    current.sold += p.sold || 0;
    current.value += (p.price || 0) * (p.stock || 0);
    categoryMap.set(catName, current);
  }

  const categoryStats = Array.from(categoryMap.values()).sort(
    (a, b) => b.value - a.value
  );

  const topSelling = [...products]
    .map((p) => ({
      name: p.name,
      stock: p.stock || 0,
      sold: p.sold || 0,
      value: (p.price || 0) * (p.sold || 0),
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const lowStockList = [...products]
    .filter((p) => (p.stock || 0) < 10)
    .map((p) => ({
      name: p.name,
      stock: p.stock || 0,
      sold: p.sold || 0,
      value: (p.price || 0) * (p.stock || 0),
    }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const sellThroughBase = totalSold + totalInventory;
  const sellThrough = sellThroughBase > 0 ? (totalSold / sellThroughBase) * 100 : 0;

  const monthlyMap = new Map<string, MonthlySalesData>();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const currentYear = new Date().getFullYear();
  for (let m = 0; m < 12; m++) {
    const monthKey = monthNames[m];
    monthlyMap.set(monthKey, { month: monthKey, sales: 0, units: 0 });
  }

  for (const p of products) {
    const createdDate = p.createdAt ? new Date(p.createdAt) : null;
    if (createdDate && createdDate.getFullYear() === currentYear) {
      const monthIdx = createdDate.getMonth();
      const monthKey = monthNames[monthIdx];
      const current = monthlyMap.get(monthKey) || { month: monthKey, sales: 0, units: 0 };
      current.sales += (p.price || 0) * (p.sold || 0);
      current.units += p.sold || 0;
      monthlyMap.set(monthKey, current);
    }
  }

  const monthlySales = Array.from(monthlyMap.values());

  return {
    totalProducts,
    totalInventory,
    lowStockProducts,
    totalValue,
    totalSold,
    totalIntake,
    categoryStats,
    topSelling,
    lowStockList,
    sellThrough,
    monthlySales,
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

        {/* Total Sold */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Sold</div>
          <div className="text-3xl font-bold text-green-400">
            {stats.totalSold}
          </div>
          <div className="text-xs text-gray-500 mt-1">units sold</div>
        </div>

        {/* Total Value Sold */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Value Sold</div>
          <div className="text-3xl font-bold text-blue-400">
            ₹{stats.totalIntake.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">revenue from sales</div>
        </div>

        {/* Current Inventory */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Current Inventory</div>
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

        {/* Inventory Value */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Inventory Value</div>
          <div className="text-3xl font-bold text-purple-400">
            ₹{stats.totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueCategoryChart categoryStats={stats.categoryStats} />
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">Sell-through Rate</div>
            <div className="text-xs text-gray-500">Sold vs stock</div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="h-24 w-24 rounded-full border border-slate-700 flex items-center justify-center text-lg font-bold text-white anim-ring"
              style={{
                background: `conic-gradient(#22c55e ${stats.sellThrough}%, #1f2937 0)`
              }}
            >
              {Math.round(stats.sellThrough)}%
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <div className="text-white text-base font-semibold">Sell-through</div>
              <div className="text-xs text-gray-500">Higher is better</div>
              <div className="text-xs text-gray-500">{stats.totalSold} sold · {stats.totalInventory} in stock</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">Top Sellers (Stock vs Sold)</div>
            <div className="text-xs text-gray-500">Last added first</div>
          </div>
          <div className="space-y-3">
            {stats.topSelling.length === 0 ? (
              <div className="text-sm text-gray-500">No sales data yet.</div>
            ) : (
              stats.topSelling.map((p, idx) => {
                const maxSold = stats.topSelling[0]?.sold || 1;
                const soldWidth = Math.max(4, (p.sold / maxSold) * 100);
                const stockWidth = Math.max(4, (p.stock / Math.max(...stats.topSelling.map(ts => ts.stock || 1))) * 100);
                return (
                  <div key={`${p.name}-${idx}`} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{p.name}</span>
                      <span>{p.sold} sold · {p.stock} stock</span>
                    </div>
                    <div className="h-3 rounded bg-slate-700 overflow-hidden flex gap-1">
                      <div
                        className="h-full bg-emerald-400 anim-bar"
                        style={{ width: `${soldWidth}%`, animationDelay: `${idx * 70}ms` }}
                        title="Sold"
                      />
                      <div
                        className="h-full bg-sky-400 anim-bar"
                        style={{ width: `${stockWidth}%`, animationDelay: `${idx * 70 + 50}ms` }}
                        title="Stock"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">Low Stock Watch</div>
            <div className="text-xs text-gray-500">Below 10 units</div>
          </div>
          <div className="space-y-3">
            {stats.lowStockList.length === 0 ? (
              <div className="text-sm text-gray-500">All stocks healthy.</div>
            ) : (
              stats.lowStockList.map((p, idx) => {
                const pct = Math.min(100, (p.stock / 10) * 100);
                return (
                  <div key={`${p.name}-${idx}`} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{p.name}</span>
                      <span>{p.stock} left</span>
                    </div>
                    <div className="h-2 rounded bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-orange-400 anim-bar"
                        style={{ width: `${pct}%`, animationDelay: `${idx * 70}ms` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">Monthly Sales</div>
          <div className="text-xs text-gray-500">Current year</div>
        </div>
        <MonthlySalesChart data={stats.monthlySales} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AiAdvisor
          summary={{
            totalProducts: stats.totalProducts,
            totalInventory: stats.totalInventory,
            totalSold: stats.totalSold,
            sellThrough: stats.sellThrough,
            categoryStats: stats.categoryStats.map((c) => ({
              category: c.category,
              stock: c.stock,
              sold: c.sold,
            })),
            topSelling: stats.topSelling.map((p) => ({
              name: p.name,
              sold: p.sold,
              stock: p.stock,
            })),
            lowStockList: stats.lowStockList.map((p) => ({
              name: p.name,
              stock: p.stock,
            })),
          }}
        />
      </div>
    </div>
  );
}
