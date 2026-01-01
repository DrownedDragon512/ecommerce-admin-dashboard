"use client";

type ProductActionsProps = {
  productId: string;
  onDelete: () => void;
};

export function ProductActions({ productId, onDelete }: ProductActionsProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(error.error || "Failed to delete product");
        return;
      }

      alert("Product deleted successfully!");
      onDelete();
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="space-x-2 text-sm">
      <button
        onClick={() => alert("Edit functionality coming soon!")}
        className="text-blue-600 hover:underline"
      >
        Edit
      </button>
      <button onClick={handleDelete} className="text-red-600 hover:underline">
        Delete
      </button>
    </div>
  );
}
