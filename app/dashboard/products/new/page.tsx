"use client";

import { useState } from "react";

export default function NewProductPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        Add New Product
      </h1>

      {/* Step Indicator */}
      <div className="mb-6 flex gap-4">
        <span className={step === 1 ? "font-bold" : ""}>1. Basic</span>
        <span className={step === 2 ? "font-bold" : ""}>2. Pricing</span>
        <span className={step === 3 ? "font-bold" : ""}>3. Image</span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="Description"
            className="w-full rounded border px-3 py-2"
          />

          <button
            onClick={() => setStep(2)}
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
          />
          <input
            type="number"
            placeholder="Stock"
            className="w-full rounded border px-3 py-2"
          />

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded border px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
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
            className="w-full rounded border px-3 py-2"
          />

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded border px-4 py-2"
            >
              Back
            </button>
            <button className="rounded bg-green-600 px-4 py-2 text-white">
              Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
