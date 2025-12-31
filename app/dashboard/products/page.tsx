export default function ProductsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>

        <a
          href="/dashboard/products/new"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Add Product
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded bg-white shadow">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">Sample Product</td>
              <td className="px-4 py-3">₹999</td>
              <td className="px-4 py-3">12</td>
              <td className="px-4 py-3 space-x-2">
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
