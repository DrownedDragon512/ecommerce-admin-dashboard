"use client";

import { useState } from "react";

export type ConfirmModalRef = {
  open: (title: string, message: string) => Promise<boolean>;
};

type ConfirmModalProps = {};

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const open = (title: string, message: string): Promise<boolean> => {
    setTitle(title);
    setMessage(message);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolvePromise?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolvePromise?.(false);
    setIsOpen(false);
  };

  const Modal = () => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-sm rounded-lg border border-[#30363d] bg-[#0d1117] p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-[#c9d1d9]">{title}</h2>
          <p className="mb-6 text-sm text-[#8b949e]">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="rounded px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:bg-[#21262d]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded bg-[#da3633] px-4 py-2 text-sm font-medium text-white hover:bg-[#f85149]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { open, Modal };
}
