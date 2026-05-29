"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Snackbar, SnackbarType } from "../../Snackbar";

const basicSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
});

const pricingSchema = z.object({
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
});

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType } | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type });
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image: "",
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const product = await res.json();
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image || "",
          });
          if (product.image) {
            setImagePreview(product.image);
          }
        } else {
          const error = await res.json().catch(() => ({ error: "Unknown error" }));
          showSnackbar(`Failed to load product: ${error.error}`, "error");
          setTimeout(() => router.push("/dashboard/products"), 500);
        }
      } catch (error) {
        showSnackbar(`Error loading product: ${error}`, "error");
        setTimeout(() => router.push("/dashboard/products"), 500);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProduct();
  }, [productId, router]);

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

  const handleSaveProduct = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          image: formData.image,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        showSnackbar(error.error || "Failed to update product", "error");
        return;
      }

      showSnackbar("Product updated successfully!", "success");
      setTimeout(() => router.push("/dashboard/products"), 500);
    } catch (error) {
      showSnackbar("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8">Loading product...</div>;
  }

  return (
    <div className="max-w-2xl p-8">
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
      <h1 className="mb-6 text-3xl font-bold">Edit Product</h1>

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
              {loading ? "Saving..." : "Update Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
