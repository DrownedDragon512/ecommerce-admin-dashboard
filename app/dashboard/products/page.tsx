"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  sold?: number;
  totalIntake?: number;
  image?: string;
  createdAt?: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [soldUnits, setSoldUnits] = useState<number>(0);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.products || []).map((p: any) => ({
          ...p,
          _id: p._id || p.id || "",
        }));
        setProducts(items);
      } else {
        console.error("Failed to load products:", res.status);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!productId) {
      alert("Missing product id");
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(error.error || "Failed to delete product");
        return;
      }

      alert("Product deleted successfully!");
      loadProducts();
    } catch (error) {
      alert("Something went wrong");
    }
  };

  const handleSoldClick = (productId: string) => {
    setSelectedProductId(productId);
    setSoldUnits(0);
    setShowSoldModal(true);
  };

  const handleMarkSold = async () => {
    if (soldUnits <= 0) {
      alert("Please enter a valid number of units");
      return;
    }

    try {
      const res = await fetch(`/api/products/${selectedProductId}/sold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ units: soldUnits }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(error.error || "Failed to mark sold");
        return;
      }

      alert(`${soldUnits} units marked as sold!`);
      setShowSoldModal(false);
      setSoldUnits(0);
      loadProducts();
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>

        <Link
          href="/dashboard/products/new"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded bg-white shadow">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Added</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500"
                    colSpan={6}
                  >
                    No products yet. Click <b>Add Product</b> to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr 
                    className="border-t transition-all duration-300 hover:bg-gray-50 hover:shadow-lg group" 
                    key={product._id}
                  >
                    <td className="px-4 py-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded transition-all duration-300 group-hover:h-24 group-hover:w-24"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 transition-all duration-300 group-hover:h-24 group-hover:w-24">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600 mt-1 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-32 group-hover:opacity-100">
                        <div>{product.description}</div>
                        <div className="mt-1 text-gray-500">Category: {product.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">₹{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-900">{product.stock}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 space-x-2 text-sm">
                      <Link
                        href={`/dashboard/products/${product._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleSoldClick(product._id)}
                        className="text-green-600 hover:underline"
                      >
                        Sold
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Sold Modal */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Mark Units as Sold</h2>
            <input
              type="number"
              min="1"
              placeholder="Enter number of units sold"
              className="w-full rounded border px-3 py-2 mb-4"
              value={soldUnits}
              onChange={(e) => setSoldUnits(Number(e.target.value))}
            />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setShowSoldModal(false)}
                className="flex-1 rounded border px-4 py-2 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkSold}
                className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Mark Sold
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
