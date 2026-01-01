import Link from "next/link";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt?: Date;
};

async function loadProducts(): Promise<Product[]> {
  const db = await getDb();

  const products = await db
    .collection("products")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return products.map((product) => ({
    ...product,
    _id: (product._id as ObjectId).toHexString(),
    createdAt: product.createdAt as Date | undefined,
  })) as Product[];
}

export default async function ProductsPage() {
  const products = await loadProducts();

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
        <table className="w-full border-collapse">
          <thead className="bg-zinc-100">
            <tr>
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
                  colSpan={5}
                >
                  No products yet. Click <b>Add Product</b> to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr className="border-t" key={product._id}>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">₹{product.price.toLocaleString()}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 space-x-2 text-sm">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
