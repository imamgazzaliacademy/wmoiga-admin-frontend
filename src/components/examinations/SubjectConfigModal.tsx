"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, Calendar, Clock, RefreshCw } from "lucide-react";
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
  ce_max_marks: number;
  ce_pass_marks: number;
  display_order: number;
  exam_date: string;
  time_slot: "Morning" | "Afternoon" | "";
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
  const [examStartDate, setExamStartDate] = useState<string>("");
  const [examEndDate, setExamEndDate] = useState<string>("");

  // Load available global subjects for selectedClass AND currently configured subjects for (exam, class)
  const loadClassSubjects = async () => {
    if (!examinationId) return;
    setLoading(true);

    try {
      // 1. Fetch exam cycle details to get start/end dates for date-picker bounds
      const examRes = await apiClient.get(`/examinations/${examinationId}`);
      if (examRes.data?.data) {
        setExamStartDate(examRes.data.data.start_date || "");
        setExamEndDate(examRes.data.data.end_date || "");
      }

      // 2. Fetch global subjects for this class
      const globalRes = await apiClient.get("/subjects", {
        params: { class_name: selectedClass, limit: 100 },
      });
      const globalList: any[] = globalRes.data?.data || [];

      // 3. Fetch currently configured subjects for this examination and class
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
          ce_max_marks: existing ? (existing.ce_max_marks ?? 0) : 0,
          ce_pass_marks: existing ? (existing.ce_pass_marks ?? 0) : 0,
          display_order: existing ? existing.display_order : idx + 1,
          exam_date: existing?.exam_date ? String(existing.exam_date).slice(0, 10) : "",
          time_slot: existing?.time_slot || "",
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

  const handleUpdateField = (
    index: number,
    field: keyof SubjectRowConfig,
    value: any
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

    if (selected.length === 0) {
      toast.warn("Please select at least one subject to configure for this class");
    }

    // Validate marks, dates, and timetable conflicts
    const scheduleSlotSet = new Set<string>();

    for (const s of selected) {
      if (s.max_marks <= 0) {
        toast.error(`Exam maximum marks for ${s.name} must be greater than zero`);
        return;
      }
      if (s.pass_marks < 0) {
        toast.error(`Exam pass marks for ${s.name} cannot be negative`);
        return;
      }
      if (s.pass_marks > s.max_marks) {
        toast.error(`Exam pass marks for ${s.name} cannot exceed exam maximum marks`);
        return;
      }
      if (s.ce_max_marks < 0) {
        toast.error(`CE maximum marks for ${s.name} cannot be negative`);
        return;
      }
      if (s.ce_pass_marks < 0) {
        toast.error(`CE pass marks for ${s.name} cannot be negative`);
        return;
      }
      if (s.ce_max_marks > 0 && s.ce_pass_marks > s.ce_max_marks) {
        toast.error(`CE pass marks for ${s.name} cannot exceed CE maximum marks`);
        return;
      }

      // Validate examination date against examination cycle bounds
      if (s.exam_date) {
        if (examStartDate && s.exam_date < examStartDate) {
          toast.error(
            `Examination date for ${s.name} (${s.exam_date}) cannot be before the examination cycle start date (${examStartDate})`
          );
          return;
        }
        if (examEndDate && s.exam_date > examEndDate) {
          toast.error(
            `Examination date for ${s.name} (${s.exam_date}) cannot be after the examination cycle end date (${examEndDate})`
          );
          return;
        }

        // Time slot conflict validation
        if (s.time_slot) {
          const slotKey = `${s.exam_date}_${s.time_slot}`;
          if (scheduleSlotSet.has(slotKey)) {
            toast.error(
              `Timetable conflict: Multiple subjects are scheduled for ${s.time_slot} on ${s.exam_date} for Class ${selectedClass}. Only one examination is permitted per time slot.`
            );
            return;
          }
          scheduleSlotSet.add(slotKey);
        }
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
          ce_max_marks: Number(s.ce_max_marks || 0),
          ce_pass_marks: Number(s.ce_max_marks || 0) > 0 ? Number(s.ce_pass_marks || 0) : 0,
          display_order: Number(s.display_order) || idx + 1,
          exam_date: s.exam_date || null,
          time_slot: s.time_slot || null,
        })),
      };

      await apiClient.post(
        `/examinations/${examinationId}/classes/${selectedClass}/subjects`,
        payload
      );

      toast.success(
        `Configured ${selected.length} subjects & timetable for Class ${selectedClass}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-neutral-300 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">Class-Wise Subject Configuration & Timetable</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Examination Event: <span className="text-white font-semibold">{examinationName}</span>
                {examStartDate && examEndDate && (
                  <span className="ml-1 sm:ml-2 font-mono text-neutral-300">
                    ({examStartDate} to {examEndDate})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Class Selection Tabs */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2 bg-neutral-50/50 border-b border-neutral-200">
          <div className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Select Class to Configure
          </div>
          <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-thin">
            {SUPPORTED_CLASSES.map((cls) => {
              const isSelected = selectedClass === cls.value;
              return (
                <button
                  key={cls.value}
                  onClick={() => setSelectedClass(cls.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${isSelected
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
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Subjects & Schedule for Class {selectedClass}
              </h3>
              <p className="text-xs text-neutral-500">
                Select applicable subjects, configure marks, examination date, and time slot.
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
            <div className="border border-neutral-200 rounded-lg overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[920px] text-left text-xs whitespace-nowrap">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                  <tr>
                    <th className="p-3 w-10 text-center">Include</th>
                    <th className="p-3">Subject Name</th>
                    <th className="p-3 w-20">Code</th>
                    <th className="p-3 w-20">Exam Max</th>
                    <th className="p-3 w-20">Exam Pass</th>
                    <th className="p-3 w-20">CE Max</th>
                    <th className="p-3 w-20">CE Pass</th>
                    <th className="p-3 w-20 text-center">Total Max</th>
                    <th className="p-3 w-32">Exam Date</th>
                    <th className="p-3 w-40">Time Slot</th>
                    <th className="p-3 w-14 text-center">Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {subjectRows.map((row, idx) => {
                    const isCeEnabled = (row.ce_max_marks || 0) > 0;
                    const totalMax = Number(row.max_marks || 0) + Number(row.ce_max_marks || 0);

                    return (
                      <tr
                        key={row.subject_id}
                        className={`transition-colors ${row.is_selected ? "bg-neutral-50/50" : "opacity-60 hover:opacity-100"
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
                              handleUpdateField(idx, "max_marks", Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100 font-medium"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            disabled={!row.is_selected}
                            min={0}
                            value={row.pass_marks}
                            onChange={(e) =>
                              handleUpdateField(idx, "pass_marks", Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100 font-medium"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            disabled={!row.is_selected}
                            min={0}
                            value={row.ce_max_marks}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setSubjectRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? {
                                      ...r,
                                      ce_max_marks: val,
                                      ce_pass_marks: val === 0 ? 0 : r.ce_pass_marks,
                                    }
                                    : r
                                )
                              );
                            }}
                            className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100 font-medium"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            disabled={!row.is_selected || !isCeEnabled}
                            min={0}
                            max={row.ce_max_marks || 0}
                            value={isCeEnabled ? row.ce_pass_marks : 0}
                            onChange={(e) =>
                              handleUpdateField(idx, "ce_pass_marks", Math.max(0, Number(e.target.value)))
                            }
                            className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100 font-medium"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <span className="font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded border border-neutral-200">
                            {totalMax}
                          </span>
                        </td>

                        <td className="p-3">
                          <input
                            type="date"
                            disabled={!row.is_selected}
                            min={examStartDate || undefined}
                            max={examEndDate || undefined}
                            value={row.exam_date}
                            onChange={(e) =>
                              handleUpdateField(idx, "exam_date", e.target.value)
                            }
                            className="w-32 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100 font-medium"
                          />
                        </td>

                        <td className="p-3">
                          <select
                            disabled={!row.is_selected}
                            value={row.time_slot}
                            onChange={(e) =>
                              handleUpdateField(idx, "time_slot", e.target.value)
                            }
                            className="w-38 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100 bg-white"
                          >
                            <option value="">No slot selected</option>
                            <option value="Morning">Morning (7:30 AM – 9:30 AM)</option>
                            <option value="Afternoon">Afternoon (2:00 PM – 4:00 PM)</option>
                          </select>
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="number"
                            disabled={!row.is_selected}
                            min={1}
                            value={row.display_order}
                            onChange={(e) =>
                              handleUpdateField(idx, "display_order", Number(e.target.value))
                            }
                            className="w-12 text-center px-1 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none disabled:bg-neutral-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 self-start sm:self-auto">
            Selected: <strong className="text-neutral-900">{subjectRows.filter((r) => r.is_selected).length}</strong> of {subjectRows.length} subjects
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveConfiguration}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 text-center"
            >
              <span>{saving ? "Saving..." : "Save Configuration & Timetable"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
