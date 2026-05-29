"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Snackbar, SnackbarType } from "../../Snackbar";

/* ------------------ Zod Schemas ------------------ */
const basicSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
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
    category: "",
    price: 0,
    stock: 0,
    image: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType } | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type });
  };

  /* ------------------ Validation Handlers ------------------ */
  const handleNextFromBasic = () => {
    const result = basicSchema.safeParse({
      name: formData.name,
      description: formData.description,
      category: formData.category,
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

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFormData({ ...formData, image: base64 });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
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
          category: formData.category,
          price: formData.price,
          stock: formData.stock,
          image: formData.image,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        showSnackbar(error.error || "Failed to save product", "error");
        return;
      }
 
      showSnackbar("Product saved successfully!", "success");
 
      setTimeout(() => router.push("/dashboard/products"), 400);
      // Reset form after save
      setFormData({
        name: "",
        description: "",
        category: "",
        price: 0,
        stock: 0,
        image: "",
      });
      setImagePreview("");
      setStep(1);
    } catch (error) {
      showSnackbar("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="max-w-2xl">
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
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

          <select
            className="w-full rounded border px-3 py-2 bg-black text-white border-gray-700"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Stationery">Stationery</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category}</p>
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
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">Pricing</div>
            <input
              type="number"
              placeholder="Price"
              className="w-full rounded border px-3 py-2"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
            />
          </div>
          {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}

          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">Quantity</div>
            <input
              type="number"
              placeholder="Stock"
              className="w-full rounded border px-3 py-2"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
            />
          </div>
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
          <div className="text-sm font-semibold text-white">Add product image</div>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded border px-3 py-2"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <div className="mt-4 border rounded p-4">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img
                src={imagePreview}
                alt="Product preview"
                className="max-w-xs max-h-64 rounded"
              />
            </div>
          )}

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
