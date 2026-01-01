"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

/* ------------------ Zod Schemas ------------------ */
const basicSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
});

const pricingSchema = z.object({
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
});

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ------------------ Validation Handlers ------------------ */
  const handleNextFromBasic = () => {
    const result = basicSchema.safeParse({
      name: formData.name,
      description: formData.description,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handleNextFromPricing = () => {
    const result = pricingSchema.safeParse({
      price: formData.price,
      stock: formData.stock,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStep(3);
  };

  /* ------------------ Save Product ------------------ */
  const handleSaveProduct = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(error.error || "Failed to save product");
        return;
      }

      alert("Product saved successfully!");

      router.push("/dashboard/products");

      // Reset form after save
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
      });
      setStep(1);
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Add New Product</h1>

      {/* Stepper */}
      <div className="mb-8 flex gap-6 text-sm">
        <span className={step === 1 ? "font-bold" : "text-gray-400"}>
          1. Basic
        </span>
        <span className={step === 2 ? "font-bold" : "text-gray-400"}>
          2. Pricing
        </span>
        <span className={step === 3 ? "font-bold" : "text-gray-400"}>
          3. Image
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            className="w-full rounded border px-3 py-2"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}

          <textarea
            placeholder="Description"
            className="w-full rounded border px-3 py-2"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}

          <button
            onClick={handleNextFromBasic}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Price"
            className="w-full rounded border px-3 py-2"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}

          <input
            type="number"
            placeholder="Stock"
            className="w-full rounded border px-3 py-2"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: Number(e.target.value) })
            }
          />
          {errors.stock && <p className="text-sm text-red-600">{errors.stock}</p>}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded border px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={handleNextFromPricing}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <input type="file" className="w-full rounded border px-3 py-2" />

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded border px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={loading}
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
