"use client";

import { useConfirmModal } from "../ConfirmModal";

type ProductActionsProps = {
  productId: string;
  onDelete: () => void;
};

export function ProductActions({ productId: id, onDelete }: ProductActionsProps) {
  const { open, Modal } = useConfirmModal();

  const handleDelete = async () => {
    const ok = await open(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    
    if (!ok) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(err.error || "Failed to delete product");
        return;
      }

      alert("Product deleted successfully!");
      onDelete();
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <Modal />
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
    </>
  );
}