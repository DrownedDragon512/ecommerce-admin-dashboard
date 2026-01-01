"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  createdAt?: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const items = (data.products || []).map((p: any) => ({
          ...p,
          _id: p._id || p.id || "",
        }));
        setProducts(items);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
                <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Added</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
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
                  <tr className="border-t" key={product._id}>
                    <td className="px-4 py-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{product.name}</td>
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
    </>
  );
}
