"use client";

import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName: string;
  isDeleting: boolean;
}

export default function StaffDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  staffName,
  isDeleting,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Trash2 size={24} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-neutral-900">
              Delete Staff Member
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-neutral-800">"{staffName}"</span>? This action is permanent and will remove all associated service and role records.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
