"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, CheckCircle2, Award } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  examination?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEditExaminationModal({
  isOpen,
  examination,
  onClose,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [examType, setExamType] = useState("Semester");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [semester, setSemester] = useState("Semester 1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"Draft" | "Open" | "Completed" | "Archived">("Draft");
  const [isHallTicketPublished, setIsHallTicketPublished] = useState(false);
  const [isResultPublished, setIsResultPublished] = useState(false);

  useEffect(() => {
    if (examination) {
      setName(examination.name || "");
      setExamType(examination.exam_type || "Semester");
      setAcademicYear(examination.academic_year || "2025-2026");
      setSemester(examination.semester || "Semester 1");
      setStartDate(examination.start_date || "");
      setEndDate(examination.end_date || "");
      setStatus(examination.status || "Draft");
      setIsHallTicketPublished(Boolean(examination.is_hall_ticket_published));
      setIsResultPublished(Boolean(examination.is_result_published));
    } else {
      setName("Semester 1 Examination 2026");
      setExamType("Semester");
      setAcademicYear("2025-2026");
      setSemester("Semester 1");
      setStartDate("");
      setEndDate("");
      setStatus("Draft");
      setIsHallTicketPublished(false);
      setIsResultPublished(false);
    }
  }, [examination, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Examination Name is required");
      return;
    }
    if (!academicYear.trim()) {
      toast.error("Academic Year is required");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(examination ? "Updating examination..." : "Creating examination cycle...");

    try {
      const payload = {
        name: name.trim(),
        exam_type: examType,
        academic_year: academicYear.trim(),
        semester: semester ? semester.trim() : null,
        class_name: null, // Shared examination cycle supporting all classes
        start_date: startDate || null,
        end_date: endDate || null,
        status,
        is_hall_ticket_published: isHallTicketPublished,
        is_result_published: isResultPublished,
      };

      if (examination) {
        await apiClient.put(`/examinations/${examination.id}`, payload);
        toast.update(loadingToast, {
          render: "Examination cycle updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await apiClient.post("/examinations", payload);
        toast.update(loadingToast, {
          render: "New examination cycle created successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.update(loadingToast, {
        render: err.response?.data?.message || "Failed to save examination cycle",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header - Black and White */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <Award size={18} className="text-neutral-300 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold truncate">
                {examination ? "Edit Examination Event" : "Create Examination Cycle"}
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                Shared cycle for all academy classes with class-specific subject evaluations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <div className="p-4 sm:p-6 space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Examination Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Semester 1 Examination 2026, Annual Examination 2026"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                >
                  <option value="Semester">Semester</option>
                  <option value="Annual">Annual</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Model">Model Exam</option>
                  <option value="Entrance">Entrance Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                >
                  {/* <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option> */}
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                  <option value="2028-2029">2028-2029</option>
                  <option value="2029-2030">2029-2030</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Semester / Category
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. Semester 1"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
            </div>

            {/* Schedule Dates & Lifecycle Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                >
                  <option value="Draft">Draft (Setup)</option>
                  <option value="Open">Open (Active)</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Publication Toggles */}
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Student Portal Availability Controls
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isHallTicketPublished}
                    onChange={(e) => setIsHallTicketPublished(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Publish Hall Tickets</span>
                    <span className="text-[11px] text-neutral-500">
                      Allows eligible students to download their hall ticket.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isResultPublished}
                    onChange={(e) => setIsResultPublished(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Publish Examination Results</span>
                    <span className="text-[11px] text-neutral-500">
                      Makes finalized mark sheets accessible in the Student Portal.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons - Solid Black and White */}
          <div className="shrink-0 flex items-center justify-end gap-2 sm:gap-3 p-3 sm:px-6 bg-neutral-50 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 sm:px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{examination ? "Update Cycle" : "Create Cycle"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
