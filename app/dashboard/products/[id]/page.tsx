"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Snackbar, SnackbarType } from "../../Snackbar";

/**
 * Zod Schemas for Form Validation
 */
const basicSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
});

const pricingSchema = z.object({
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
});

/**
 * Type Definitions
 */
type ProductDraft = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
};

type FormErrors = Record<string, string>;

type AlertState = {
  message: string;
  type: SnackbarType;
} | null;

export default function EditProductPage() {
  // Routing and Params
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // UI State Management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [imagePreviewUri, setImagePreviewUri] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [systemAlert, setSystemAlert] = useState<AlertState>(null);

  // Form State
  const [productDraft, setProductDraft] = useState<ProductDraft>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image: "",
  });

  /**
   * Dispatch a system alert (Snackbar)
   */
  const dispatchAlert = (message: string, type: SnackbarType = "info") => {
    setSystemAlert({ message, type });
  };

  /**
   * Generic field change handler to unify state updates
   */
  const handleFieldChange = (field: keyof ProductDraft, value: string | number) => {
    setProductDraft((prev) => ({ ...prev, [field]: value }));
    // Clear error for the specific field upon typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /**
   * Hydrate form with existing product data on mount
   */
  useEffect(() => {
    let isMounted = true;

    const hydrateProductData = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const product = await response.json();
          if (isMounted) {
            setProductDraft({
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              image: product.image || "",
            });
            if (product.image) setImagePreviewUri(product.image);
          }
        } else {
          const errorPayload = await response.json().catch(() => ({ error: "Unknown error" }));
          dispatchAlert(`Failed to load product: ${errorPayload.error}`, "error");
          setTimeout(() => { if (isMounted) router.push("/dashboard/products"); }, 500);
        }
      } catch (error) {
        dispatchAlert(`Error loading product: ${error}`, "error");
        setTimeout(() => { if (isMounted) router.push("/dashboard/products"); }, 500);
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    };

    hydrateProductData();

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, [productId, router]);

  /**
   * Validation & Navigation: Step 1 -> Step 2
   */
  const proceedToPricing = () => {
    const validation = basicSchema.safeParse({
      name: productDraft.name,
      description: productDraft.description,
    });

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setValidationErrors({});
    setCurrentStep(2);
  };

  /**
   * Validation & Navigation: Step 2 -> Step 3
   */
  const proceedToMedia = () => {
    const validation = pricingSchema.safeParse({
      price: productDraft.price,
      stock: productDraft.stock,
    });

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setValidationErrors({});
    setCurrentStep(3);
  };

  /**
   * Process and encode image file to Base64
   */
  const processImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const encodedString = e.target?.result as string;
      setProductDraft((prev) => ({ ...prev, image: encodedString }));
      setImagePreviewUri(encodedString);
    };
    fileReader.readAsDataURL(file);
  };

  /**
   * Final Submission Handler
   */
  const commitProductUpdates = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productDraft),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: "Unknown error" }));
        dispatchAlert(errorPayload.error || "Failed to update product", "error");
        return;
      }

      dispatchAlert("Product updated successfully!", "success");
      setTimeout(() => router.push("/dashboard/products"), 500);
    } catch (error) {
      dispatchAlert("Critical failure during submission", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render function for form steps (Switch Architecture)
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <input
              type="text"
              placeholder="Product Name"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={productDraft.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
            {validationErrors.name && <p className="text-sm text-red-600">{validationErrors.name}</p>}

            <textarea
              placeholder="Description"
              className="w-full rounded border px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-black"
              value={productDraft.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600">{validationErrors.description}</p>
            )}

            <button
              onClick={proceedToPricing}
              className="rounded bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
            >
              Next Step
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <input
              type="number"
              placeholder="Price"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={productDraft.price || ""}
              onChange={(e) => handleFieldChange("price", Number(e.target.value))}
            />
            {validationErrors.price && <p className="text-sm text-red-600">{validationErrors.price}</p>}

            <input
              type="number"
              placeholder="Stock Quantity"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={productDraft.stock || ""}
              onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
            />
            {validationErrors.stock && <p className="text-sm text-red-600">{validationErrors.stock}</p>}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="rounded border border-gray-300 px-6 py-2 transition-colors hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={proceedToMedia}
                className="rounded bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
              >
                Next Step
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                onChange={processImageUpload}
              />
            </div>

            {imagePreviewUri && (
              <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">Media Preview</p>
                <img
                  src={imagePreviewUri}
                  alt="Product preview"
                  className="max-w-xs max-h-64 rounded object-cover shadow-sm"
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded border border-gray-300 px-6 py-2 transition-colors hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={commitProductUpdates}
                disabled={isSubmitting}
                className="rounded bg-green-600 px-6 py-2 text-white font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Finalizing Update..." : "Confirm & Save Product"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isHydrating) {
    return (
      <div className="flex h-64 items-center justify-center p-8">
        <div className="text-gray-500 font-medium animate-pulse">Synchronizing product data...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      {systemAlert && (
        <Snackbar
          message={systemAlert.message}
          type={systemAlert.type}
          onClose={() => setSystemAlert(null)}
        />
      )}
      
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workspace: Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">Modify product parameters, pricing, and media assets.</p>
      </header>

      {/* Progress Indicator */}
      <nav aria-label="Progress">
        <ol className="mb-8 flex gap-6 text-sm font-medium border-b pb-4">
          <li className={currentStep >= 1 ? "text-black" : "text-gray-400"}>
            <span className="mr-2">01</span> Configuration
          </li>
          <li className={currentStep >= 2 ? "text-black" : "text-gray-400"}>
            <span className="mr-2">02</span> Economics
          </li>
          <li className={currentStep >= 3 ? "text-black" : "text-gray-400"}>
            <span className="mr-2">03</span> Media Assets
          </li>
        </ol>
      </nav>

      {/* Dynamic Step Injection */}
      <main className="min-h-[300px]">
        {renderCurrentStep()}
      </main>
    </div>
  );
}