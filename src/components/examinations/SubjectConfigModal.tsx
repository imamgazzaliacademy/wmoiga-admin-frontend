"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, CheckCircle2, Trash2, Plus, RefreshCw, Check } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";

interface Props {
  isOpen: boolean;
  examinationId: number | null;
  examinationName: string;
  onClose: () => void;
  onUpdated?: () => void;
}

interface SubjectRowConfig {
  subject_id: number;
  name: string;
  code: string | null;
  is_selected: boolean;
  max_marks: number;
  pass_marks: number;
  display_order: number;
}

export default function SubjectConfigModal({
  isOpen,
  examinationId,
  examinationName,
  onClose,
  onUpdated,
}: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subjectRows, setSubjectRows] = useState<SubjectRowConfig[]>([]);

  // Load available global subjects for selectedClass AND currently configured subjects for (exam, class)
  const loadClassSubjects = async () => {
    if (!examinationId) return;
    setLoading(true);

    try {
      // 1. Fetch global subjects for this class
      const globalRes = await apiClient.get("/subjects", {
        params: { class_name: selectedClass, limit: 100 },
      });
      const globalList: any[] = globalRes.data?.data || [];

      // 2. Fetch currently configured subjects for this examination and class
      const configuredRes = await apiClient.get(
        `/examinations/${examinationId}/classes/${selectedClass}/subjects`
      );
      const configuredList: any[] = configuredRes.data?.data || [];

      const configuredMap = new Map<number, any>();
      configuredList.forEach((c) => {
        const sid = c.subject_id || c.id;
        configuredMap.set(sid, c);
      });

      // Merge into subject rows
      const rows: SubjectRowConfig[] = globalList.map((g, idx) => {
        const existing = configuredMap.get(g.id);
        return {
          subject_id: g.id,
          name: g.name,
          code: g.code,
          is_selected: Boolean(existing),
          max_marks: existing ? existing.max_marks : 100,
          pass_marks: existing ? existing.pass_marks : 35,
          display_order: existing ? existing.display_order : idx + 1,
        };
      });

      setSubjectRows(rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load class subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && examinationId) {
      loadClassSubjects();
    }
  }, [isOpen, examinationId, selectedClass]);

  const handleToggleSelect = (index: number) => {
    setSubjectRows((prev) =>
      prev.map((row, idx) =>
        idx === index ? { ...row, is_selected: !row.is_selected } : row
      )
    );
  };

  const handleUpdateMarks = (
    index: number,
    field: "max_marks" | "pass_marks" | "display_order",
    value: number
  ) => {
    setSubjectRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSelectAll = () => {
    setSubjectRows((prev) => prev.map((row) => ({ ...row, is_selected: true })));
  };

  const handleDeselectAll = () => {
    setSubjectRows((prev) => prev.map((row) => ({ ...row, is_selected: false })));
  };

  const handleSaveConfiguration = async () => {
    if (!examinationId) return;

    const selected = subjectRows.filter((r) => r.is_selected);

    // Validate marks
    for (const s of selected) {
      if (s.max_marks <= 0) {
        toast.error(`Maximum marks for ${s.name} must be greater than zero`);
        return;
      }
      if (s.pass_marks < 0) {
        toast.error(`Pass marks for ${s.name} cannot be negative`);
        return;
      }
      if (s.pass_marks > s.max_marks) {
        toast.error(`Pass marks for ${s.name} cannot exceed maximum marks`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        class_name: selectedClass,
        subjects: selected.map((s, idx) => ({
          subject_id: s.subject_id,
          max_marks: Number(s.max_marks),
          pass_marks: Number(s.pass_marks),
          display_order: Number(s.display_order) || idx + 1,
        })),
      };

      await apiClient.post(
        `/examinations/${examinationId}/classes/${selectedClass}/subjects`,
        payload
      );

      toast.success(
        `Configured ${selected.length} subjects for Class ${selectedClass}`
      );
      onUpdated?.();
      loadClassSubjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-neutral-300" />
            <div>
              <h2 className="text-base font-bold">Class-Wise Subject Configuration</h2>
              <p className="text-xs text-neutral-400">
                Examination Event: <span className="text-white font-semibold">{examinationName}</span>
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

        {/* Class Selection Tabs */}
        <div className="px-6 pt-4 pb-2 bg-neutral-50/50 border-b border-neutral-200">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Select Class to Configure
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_CLASSES.map((cls) => {
              const isSelected = selectedClass === cls.value;
              return (
                <button
                  key={cls.value}
                  onClick={() => setSelectedClass(cls.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "bg-white text-neutral-700 hover:bg-neutral-200/70 border border-neutral-200"
                  }`}
                >
                  {cls.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Available Subjects for Class {selectedClass}
              </h3>
              <p className="text-xs text-neutral-500">
                Check subjects applicable to this examination cycle and configure their maximum and pass marks.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-neutral-700 border border-neutral-300 rounded hover:bg-neutral-100"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2.5 py-1 text-neutral-700 border border-neutral-300 rounded hover:bg-neutral-100"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={loadClassSubjects}
                title="Reload"
                className="p-1 border border-neutral-300 rounded hover:bg-neutral-100 text-neutral-600"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-neutral-500">
              <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading subjects for Class {selectedClass}...
            </div>
          ) : subjectRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 border border-dashed rounded-lg space-y-1">
              <p className="font-semibold text-neutral-800">
                No global subjects configured for Class {selectedClass}
              </p>
              <p className="text-neutral-400">
                Visit the "Subjects" section in the sidebar to assign subjects to Class {selectedClass}.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                  <tr>
                    <th className="p-3 w-10">Include</th>
                    <th className="p-3">Subject Name</th>
                    <th className="p-3 w-28">Code</th>
                    <th className="p-3 w-28">Max Marks</th>
                    <th className="p-3 w-28">Pass Marks</th>
                    <th className="p-3 w-20">Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {subjectRows.map((row, idx) => (
                    <tr
                      key={row.subject_id}
                      className={`transition-colors ${
                        row.is_selected ? "bg-neutral-50/50" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.is_selected}
                          onChange={() => handleToggleSelect(idx)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-neutral-900">{row.name}</span>
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          {row.code || "-"}
                        </span>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          disabled={!row.is_selected}
                          min={1}
                          value={row.max_marks}
                          onChange={(e) =>
                            handleUpdateMarks(idx, "max_marks", Number(e.target.value))
                          }
                          className="w-20 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          disabled={!row.is_selected}
                          min={0}
                          value={row.pass_marks}
                          onChange={(e) =>
                            handleUpdateMarks(idx, "pass_marks", Number(e.target.value))
                          }
                          className="w-20 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          disabled={!row.is_selected}
                          min={1}
                          value={row.display_order}
                          onChange={(e) =>
                            handleUpdateMarks(idx, "display_order", Number(e.target.value))
                          }
                          className="w-14 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Buttons - Solid Black and White */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50/50">
          <div className="text-xs text-neutral-500">
            Selected: <span className="font-bold text-neutral-900">{subjectRows.filter((r) => r.is_selected).length}</span> subjects for Class {selectedClass}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveConfiguration}
              disabled={saving || loading}
              className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Configuration for Class {selectedClass}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
