"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, CheckCircle2 } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";

interface Props {
  isOpen: boolean;
  subject: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEditSubjectModal({ isOpen, subject, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    if (subject) {
      setName(subject.name || "");
      setCode(subject.code || "");
      let classes: string[] = [];
      if (Array.isArray(subject.applicable_classes)) {
        classes = subject.applicable_classes;
      } else if (typeof subject.applicable_classes === "string") {
        try {
          classes = JSON.parse(subject.applicable_classes);
        } catch {
          classes = subject.applicable_classes.split(",").map((c: string) => c.trim()).filter(Boolean);
        }
      }
      setSelectedClasses(classes);
      setStatus(subject.status || "Active");
    } else {
      setName("");
      setCode("");
      setSelectedClasses([]);
      setStatus("Active");
    }
  }, [subject, isOpen]);

  const toggleClass = (clsVal: string) => {
    if (selectedClasses.includes(clsVal)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== clsVal));
    } else {
      setSelectedClasses([...selectedClasses, clsVal]);
    }
  };

  const selectAllClasses = () => {
    setSelectedClasses(SUPPORTED_CLASSES.map((c) => c.value));
  };

  const clearAllClasses = () => {
    setSelectedClasses([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Subject Name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim() ? code.trim() : null,
        applicable_classes: selectedClasses,
        status,
      };

      if (subject) {
        await apiClient.put(`/subjects/${subject.id}`, payload);
        toast.success(`Subject "${name}" updated successfully`);
      } else {
        await apiClient.post("/subjects", payload);
        toast.success(`Subject "${name}" created successfully`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save subject");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-neutral-300" />
            <div>
              <h2 className="text-base font-bold">
                {subject ? "Edit Global Subject" : "Add New Subject"}
              </h2>
              <p className="text-xs text-neutral-400">
                Configure subject details and applicable academic classes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mathematics, English Literature, Islamic Jurisprudence"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Subject Code <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MATH101, ENG08"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Applicable Classes Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Applicable Classes
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAllClasses}
                    className="text-neutral-600 hover:text-neutral-900 underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={clearAllClasses}
                    className="text-neutral-600 hover:text-neutral-900 underline font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                {SUPPORTED_CLASSES.map((cls) => {
                  const isChecked = selectedClasses.includes(cls.value);
                  return (
                    <label
                      key={cls.value}
                      className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-neutral-900 text-white border-neutral-900 font-semibold"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleClass(cls.value)}
                        className="hidden"
                      />
                      <span>{cls.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Select which classes are eligible to study and take examinations in this subject.
              </p>
            </div>
          </div>

          {/* Action Buttons - Solid Black and White */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{subject ? "Update Subject" : "Create Subject"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
