"use client";

import React, { useState, useEffect } from "react";
import { X, Download, FileSpreadsheet, FileText, Search, Award, Printer, Check, Clock } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";

interface Props {
  isOpen: boolean;
  examinationId: number | null;
  examinationName: string;
  onClose: () => void;
}

export default function ClassMarkListModal({
  isOpen,
  examinationId,
  examinationName,
  onClose,
}: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchData = async () => {
    if (!examinationId) return;
    setLoading(true);
    try {
      // 1. Fetch subjects configured for this class
      const subjRes = await apiClient.get(
        `/examinations/${examinationId}/classes/${selectedClass}/subjects`
      );
      setSubjects(subjRes.data?.data || []);

      // 2. Fetch students and their marks for this class
      const res = await apiClient.get(`/examinations/${examinationId}/students_marks`, {
        params: { class_name: selectedClass, limit: 100 },
      });
      if (res.data?.data) {
        setStudents(res.data.data.students || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load class mark list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && examinationId) {
      fetchData();
    }
  }, [isOpen, examinationId, selectedClass]);

  const handleExportExcel = async () => {
    if (!examinationId) return;
    setExportingExcel(true);
    const loadingToast = toast.loading("Generating class results spreadsheet...");
    try {
      const response = await apiClient.get(
        `/examinations/${examinationId}/results/export/excel?class_name=${selectedClass}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ClassResults_${selectedClass}_${examinationName.replace(/\s+/g, "_")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.update(loadingToast, {
        render: "Excel Export Complete!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, {
        render: "Failed to export Excel",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (!examinationId) return;
    setExportingPdf(true);
    const loadingToast = toast.loading("Generating printable class tabulation PDF...");
    try {
      const response = await apiClient.get(
        `/examinations/${examinationId}/results/export/pdf?class_name=${selectedClass}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ClassTabulation_${selectedClass}_${examinationName.replace(/\s+/g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.update(loadingToast, {
        render: "PDF Export Complete!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, {
        render: "Failed to export PDF",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold truncate">Class Mark List & Academic Tabulation</h2>
            <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
              Examination: <span className="text-white font-semibold">{examinationName}</span> • Scoped to selected class
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Class Selection & Action Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-50/50 border-b border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <span className="shrink-0 text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Class:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {SUPPORTED_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls.value;
                return (
                  <button
                    key={cls.value}
                    onClick={() => setSelectedClass(cls.value)}
                    className={`px-2.5 sm:px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${isSelected
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                      }`}
                  >
                    {cls.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel || loading}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={exportingPdf || loading}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Printer size={14} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs">
          <div className="relative w-full sm:max-w-sm">
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by student name or admission no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
            />
          </div>

          <span className="text-neutral-500 text-[11px] sm:text-xs">
            Enrolled Students in Class {selectedClass}: <span className="font-bold text-neutral-900">{filteredStudents.length}</span>
          </span>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-neutral-500">
              <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading tabulation sheet...
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 border border-dashed rounded-lg space-y-1">
              <p className="font-semibold text-neutral-800">
                No subjects configured for Class {selectedClass} in this examination
              </p>
              <p className="text-neutral-400">
                Please open "Configure Subjects" to define evaluation criteria for Class {selectedClass}.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 border border-dashed rounded-lg">
              No students found for Class {selectedClass}.
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-10">Sl</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    {subjects.map((subj) => {
                      const isCE = Number(subj.ce_max_marks || 0) > 0;
                      const subjTotalMax = Number(subj.max_marks) + (isCE ? Number(subj.ce_max_marks || 0) : 0);
                      return (
                        <th key={subj.subject_id !== undefined && subj.subject_id !== null ? Number(subj.subject_id) : Number(subj.id)} className="p-3 text-center">
                          <div>{subj.name}</div>
                          <div className="text-[10px] font-normal text-neutral-400">
                            {isCE ? `Exam: ${subj.max_marks} | CE: ${subj.ce_max_marks} (${subjTotalMax})` : `(Max: ${subj.max_marks})`}
                          </div>
                        </th>
                      );
                    })}
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center">Percentage</th>
                    <th className="p-3 text-center">Result</th>
                    <th className="p-3 text-center">Class Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredStudents.map((std, idx) => {
                    const markMap = new Map<number, any>();
                    if (std.marks) {
                      std.marks.forEach((m: any) => markMap.set(Number(m.subject_id), m));
                    }
                    const resRecord = std.results && std.results.length > 0 ? std.results[0] : null;

                    return (
                      <tr key={std.id} className="hover:bg-neutral-50/60">
                        <td className="p-3 text-neutral-400">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-neutral-900">
                          {std.admission_number}
                        </td>
                        <td className="p-3 font-semibold text-neutral-900">{std.full_name}</td>

                        {subjects.map((subj) => {
                          const subjKey = subj.subject_id !== undefined && subj.subject_id !== null ? Number(subj.subject_id) : Number(subj.id);
                          const mark = markMap.get(subjKey);
                          const isCE = Number(subj.ce_max_marks || 0) > 0;
                          if (!mark) {
                            return (
                              <td key={subjKey} className="p-3 text-center text-neutral-400">
                                -
                              </td>
                            );
                          }
                          if (mark.is_absent) {
                            return (
                              <td key={subjKey} className="p-3 text-center text-neutral-500 font-bold">
                                Ab
                              </td>
                            );
                          }
                          const examObt = mark.exam_marks_obtained !== null && mark.exam_marks_obtained !== undefined ? mark.exam_marks_obtained : mark.marks_obtained;
                          const ceObt = mark.ce_marks_obtained || 0;

                          return (
                            <td key={subjKey} className="p-3 text-center font-medium">
                              <span
                                className={
                                  mark.is_passed ? "text-neutral-900 font-bold" : "text-red-700 font-bold"
                                }
                              >
                                {mark.marks_obtained}
                              </span>
                              {isCE && (
                                <span className="text-[10px] text-neutral-400 block font-normal">
                                  ({examObt} + {ceObt})
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-3 text-center font-bold text-neutral-900">
                          {resRecord ? `${resRecord.total_marks_obtained} / ${resRecord.total_max_marks}` : "-"}
                        </td>

                        <td className="p-3 text-center font-semibold">
                          {resRecord ? `${resRecord.percentage}%` : "-"}
                        </td>

                        <td className="p-3 text-center">
                          {resRecord ? (
                            resRecord.is_complete ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${resRecord.is_passed
                                    ? "bg-neutral-100 text-neutral-900 border border-neutral-300"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                              >
                                {resRecord.is_passed ? "PASSED" : "FAILED"}
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">Incomplete</span>
                            )
                          ) : (
                            <span className="text-neutral-400 italic">Pending</span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {resRecord && resRecord.class_rank !== null ? (
                            <span className="font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded text-[11px]">
                              {resRecord.class_rank}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
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
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
