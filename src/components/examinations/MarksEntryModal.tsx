"use client";

import React, { useState, useEffect } from "react";
import { X, Search, CheckCircle2, User, Award, Save, RefreshCw, Check, ArrowRight } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";

interface Props {
  isOpen: boolean;
  examinationId: number | null;
  examinationName: string;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function MarksEntryModal({
  isOpen,
  examinationId,
  examinationName,
  onClose,
  onUpdated,
}: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  interface StudentSubjectMarkState {
    exam_marks_obtained: number;
    ce_marks_obtained: number;
    marks_obtained: number;
    is_absent: boolean;
  }

  // Current marks being edited: subject_id -> StudentSubjectMarkState
  const [marksState, setMarksState] = useState<Record<number, StudentSubjectMarkState>>({});
  const [calculatedResult, setCalculatedResult] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Load students for the selected class and configured subjects
  const loadClassData = async () => {
    if (!examinationId) return;
    setLoading(true);

    try {
      // 1. Fetch subjects configured for this exam and class
      const subjectsRes = await apiClient.get(
        `/examinations/${examinationId}/classes/${selectedClass}/subjects`
      );
      const configuredSubjects = subjectsRes.data?.data || [];
      setSubjects(configuredSubjects);

      // 2. Fetch students belonging to this class with their existing marks
      const studentsRes = await apiClient.get(
        `/examinations/${examinationId}/students_marks`,
        {
          params: { class_name: selectedClass, limit: 100 },
        }
      );
      const stdList = studentsRes.data?.data?.students || [];
      setStudents(stdList);

      if (stdList.length > 0) {
        setSelectedStudentId(stdList[0].id);
      } else {
        setSelectedStudentId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load class examination subjects and students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && examinationId) {
      loadClassData();
    }
  }, [isOpen, examinationId, selectedClass]);

  // When selected student changes, populate their saved marks
  useEffect(() => {
    if (!selectedStudentId || students.length === 0) {
      setMarksState({});
      setCalculatedResult(null);
      return;
    }

    const std = students.find((s) => s.id === selectedStudentId);
    if (!std) return;

    const initialMarks: Record<number, StudentSubjectMarkState> = {};
    if (std.marks && std.marks.length > 0) {
      std.marks.forEach((m: any) => {
        const examMarks = m.exam_marks_obtained !== null && m.exam_marks_obtained !== undefined
          ? Number(m.exam_marks_obtained)
          : Number(m.marks_obtained);
        const ceMarks = Number(m.ce_marks_obtained || 0);
        initialMarks[m.subject_id] = {
          exam_marks_obtained: examMarks,
          ce_marks_obtained: ceMarks,
          marks_obtained: Number(m.marks_obtained),
          is_absent: Boolean(m.is_absent),
        };
      });
    }

    setMarksState(initialMarks);
    const existingResult = std.results && std.results.length > 0 ? std.results[0] : null;
    setCalculatedResult(existingResult);
  }, [selectedStudentId, students]);

  const handleExamMarkChange = (subjectId: number, maxMarks: number, isCE: boolean, val: string) => {
    const num = parseFloat(val);
    const current = marksState[subjectId] || { exam_marks_obtained: 0, ce_marks_obtained: 0, marks_obtained: 0, is_absent: false };

    if (isNaN(num)) {
      const updatedTotal = isCE ? current.ce_marks_obtained : 0;
      setMarksState((prev) => ({
        ...prev,
        [subjectId]: { ...current, exam_marks_obtained: 0, marks_obtained: updatedTotal },
      }));
      return;
    }

    if (num > maxMarks) {
      toast.warn(`Exam marks cannot exceed maximum marks (${maxMarks})`);
      return;
    }
    if (num < 0) {
      toast.warn("Exam marks cannot be negative");
      return;
    }

    const updatedTotal = num + (isCE ? current.ce_marks_obtained : 0);
    setMarksState((prev) => ({
      ...prev,
      [subjectId]: { ...current, exam_marks_obtained: num, marks_obtained: updatedTotal },
    }));
  };

  const handleCeMarkChange = (subjectId: number, ceMaxMarks: number, val: string) => {
    const num = parseFloat(val);
    const current = marksState[subjectId] || { exam_marks_obtained: 0, ce_marks_obtained: 0, marks_obtained: 0, is_absent: false };

    if (isNaN(num)) {
      const updatedTotal = current.exam_marks_obtained;
      setMarksState((prev) => ({
        ...prev,
        [subjectId]: { ...current, ce_marks_obtained: 0, marks_obtained: updatedTotal },
      }));
      return;
    }

    if (num > ceMaxMarks) {
      toast.warn(`CE marks cannot exceed CE maximum marks (${ceMaxMarks})`);
      return;
    }
    if (num < 0) {
      toast.warn("CE marks cannot be negative");
      return;
    }

    const updatedTotal = current.exam_marks_obtained + num;
    setMarksState((prev) => ({
      ...prev,
      [subjectId]: { ...current, ce_marks_obtained: num, marks_obtained: updatedTotal },
    }));
  };

  const handleToggleAbsent = (subjectId: number) => {
    setMarksState((prev) => {
      const current = prev[subjectId] || { exam_marks_obtained: 0, ce_marks_obtained: 0, marks_obtained: 0, is_absent: false };
      return {
        ...prev,
        [subjectId]: {
          ...current,
          is_absent: !current.is_absent,
        },
      };
    });
  };

  const handleSaveMarks = async () => {
    if (!examinationId || !selectedStudentId) return;

    const marksPayload = subjects.map((subj) => {
      const subjKey = subj.subject_id !== undefined && subj.subject_id !== null ? Number(subj.subject_id) : Number(subj.id);
      const isCE = Number(subj.ce_max_marks || 0) > 0;
      const entry = marksState[subjKey] || { exam_marks_obtained: 0, ce_marks_obtained: 0, marks_obtained: 0, is_absent: false };
      const examObt = entry.is_absent ? null : entry.exam_marks_obtained;
      const ceObt = entry.is_absent ? 0 : (isCE ? entry.ce_marks_obtained : 0);
      const totalObt = entry.is_absent ? 0 : (entry.exam_marks_obtained + (isCE ? entry.ce_marks_obtained : 0));
      return {
        subject_id: subjKey,
        exam_marks_obtained: examObt,
        ce_marks_obtained: ceObt,
        marks_obtained: totalObt,
        is_absent: entry.is_absent,
      };
    });

    setSaving(true);
    try {
      const res = await apiClient.post(
        `/examinations/${examinationId}/marks/${selectedStudentId}`,
        {
          class_name: selectedClass,
          marks: marksPayload,
        }
      );

      toast.success("Marks saved and results recalculated successfully");
      if (res.data?.data) {
        setCalculatedResult(res.data.data);
      }

      onUpdated?.();

      // Refresh student list in background to keep data in sync
      const studentsRes = await apiClient.get(
        `/examinations/${examinationId}/students_marks`,
        {
          params: { class_name: selectedClass, limit: 100 },
        }
      );
      if (studentsRes.data?.data?.students) {
        setStudents(studentsRes.data.data.students);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectNextStudent = () => {
    const currentIndex = filteredStudents.findIndex((s) => s.id === selectedStudentId);
    if (currentIndex >= 0 && currentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentIndex + 1].id);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admission_number?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Award size={18} className="text-neutral-300 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">Marks Entry & Evaluation Workflow</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Examination: <span className="text-white font-semibold">{examinationName}</span>
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

        {/* Step 1 & 2: Class Selection */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider shrink-0">
              Select Class:
            </span>
            <div className="flex overflow-x-auto gap-1 scrollbar-thin">
              {SUPPORTED_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls.value;
                return (
                  <button
                    key={cls.value}
                    onClick={() => setSelectedClass(cls.value)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
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

          <button
            onClick={loadClassData}
            title="Refresh Class Data"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-neutral-300 rounded hover:bg-neutral-100 shrink-0"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Workflow Body: Two Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto lg:overflow-hidden">
          {/* Left Column: Student List for Selected Class */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-neutral-200 p-3 sm:p-4 flex flex-col gap-2.5 bg-neutral-50/50 max-h-56 lg:max-h-none overflow-hidden shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Students ({filteredStudents.length})
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">Class {selectedClass}</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white"
              />
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {loading ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Loading class students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 border border-dashed rounded-md p-4">
                  No active students enrolled in Class {selectedClass}.
                </div>
              ) : (
                filteredStudents.map((std) => {
                  const isSelected = std.id === selectedStudentId;
                  const resRecord = std.results && std.results.length > 0 ? std.results[0] : null;
                  const isGraded = resRecord && resRecord.is_complete;

                  return (
                    <button
                      key={std.id}
                      onClick={() => setSelectedStudentId(std.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                          : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold truncate">{std.full_name}</div>
                        <div
                          className={`font-mono text-[10px] ${
                            isSelected ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {std.admission_number}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isGraded ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : resRecord.is_passed
                                ? "bg-neutral-100 text-neutral-900 border border-neutral-300"
                                : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {resRecord.is_passed ? "Pass" : "Fail"}
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] italic ${
                              isSelected ? "text-neutral-400" : "text-neutral-400"
                            }`}
                          >
                            Pending
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Marks Entry Sheet for Selected Student */}
          <div className="lg:col-span-8 p-5 flex flex-col justify-between overflow-y-auto">
            {!selectedStudent ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                Please select a student from the list to enter marks.
              </div>
            ) : subjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-neutral-500 space-y-2 p-6 text-center">
                <Award size={36} className="text-neutral-300" />
                <p className="font-bold text-sm text-neutral-800">
                  No Subjects Configured for Class {selectedClass}
                </p>
                <p className="text-neutral-400 max-w-sm">
                  Please open "Configure Subjects" for this examination cycle to set up evaluation modules for Class {selectedClass}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Student Banner */}
                <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                      Evaluating Student
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900">{selectedStudent.full_name}</h3>
                    <span className="font-mono text-xs text-neutral-600">
                      {selectedStudent.admission_number} • Class {selectedClass}
                    </span>
                  </div>

                  {calculatedResult && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Calculated Result
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">
                          {calculatedResult.total_marks_obtained} / {calculatedResult.total_max_marks} ({calculatedResult.percentage}%)
                        </span>
                        <Badge
                          variant={calculatedResult.is_passed ? "default" : "destructive"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {calculatedResult.is_passed ? "PASSED" : "FAILED"}
                        </Badge>
                        {calculatedResult.class_rank && (
                          <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.5 rounded">
                            Rank #{calculatedResult.class_rank}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Marks Entry Table */}
                <div className="border border-neutral-200 rounded-lg overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[680px] text-left text-xs whitespace-nowrap">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5 w-24">Exam (Max/Pass)</th>
                        <th className="p-2.5 w-24">CE (Max/Pass)</th>
                        <th className="p-2.5 w-24">Exam Obt</th>
                        <th className="p-2.5 w-24">CE Obt</th>
                        <th className="p-2.5 w-24 text-center">Total</th>
                        <th className="p-2.5 w-16 text-center">Absent</th>
                        <th className="p-2.5 w-20 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {subjects.map((subj) => {
                        const subjKey = subj.subject_id !== undefined && subj.subject_id !== null ? Number(subj.subject_id) : Number(subj.id);
                        const isCE = Number(subj.ce_max_marks || 0) > 0;
                        const entry = marksState[subjKey] || { exam_marks_obtained: 0, ce_marks_obtained: 0, marks_obtained: 0, is_absent: false };

                        const examPassed = entry.exam_marks_obtained >= subj.pass_marks;
                        const cePassed = !isCE || entry.ce_marks_obtained >= (subj.ce_pass_marks || 0);
                        const isPassed = !entry.is_absent && examPassed && cePassed;
                        const totalMax = Number(subj.max_marks) + (isCE ? Number(subj.ce_max_marks || 0) : 0);
                        const currentTotal = entry.is_absent ? 0 : (entry.exam_marks_obtained + (isCE ? entry.ce_marks_obtained : 0));

                        return (
                          <tr key={subjKey} className="hover:bg-neutral-50/50">
                            <td className="p-2.5">
                              <span className="font-semibold text-neutral-900">{subj.name}</span>
                              {subj.code && (
                                <span className="font-mono text-[10px] text-neutral-400 block">
                                  {subj.code}
                                </span>
                              )}
                            </td>

                            <td className="p-2.5 font-medium text-neutral-700">
                              <span>{subj.max_marks}</span>
                              <span className="text-neutral-400 font-normal"> / {subj.pass_marks}</span>
                            </td>

                            <td className="p-2.5 font-medium text-neutral-700">
                              {isCE ? (
                                <>
                                  <span>{subj.ce_max_marks}</span>
                                  <span className="text-neutral-400 font-normal"> / {subj.ce_pass_marks || 0}</span>
                                </>
                              ) : (
                                <span className="text-neutral-400 font-mono">-</span>
                              )}
                            </td>

                            <td className="p-2.5">
                              <input
                                type="number"
                                disabled={entry.is_absent}
                                min={0}
                                max={subj.max_marks}
                                value={entry.exam_marks_obtained}
                                onChange={(e) =>
                                  handleExamMarkChange(subjKey, subj.max_marks, isCE, e.target.value)
                                }
                                className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none font-bold disabled:bg-neutral-100 text-neutral-900"
                              />
                            </td>

                            <td className="p-2.5">
                              {isCE ? (
                                <input
                                  type="number"
                                  disabled={entry.is_absent}
                                  min={0}
                                  max={subj.ce_max_marks}
                                  value={entry.ce_marks_obtained}
                                  onChange={(e) =>
                                    handleCeMarkChange(subjKey, subj.ce_max_marks, e.target.value)
                                  }
                                  className="w-16 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none font-bold disabled:bg-neutral-100 text-neutral-900"
                                />
                              ) : (
                                <span className="text-neutral-400 font-mono text-center block">-</span>
                              )}
                            </td>

                            <td className="p-2.5 text-center">
                              <span className="font-bold text-xs bg-neutral-100 text-neutral-900 px-2 py-1 rounded border border-neutral-200">
                                {currentTotal} / {totalMax}
                              </span>
                            </td>

                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={entry.is_absent}
                                onChange={() => handleToggleAbsent(subjKey)}
                                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5 text-center">
                              {entry.is_absent ? (
                                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                  Absent
                                </span>
                              ) : (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isPassed
                                      ? "text-neutral-900 bg-neutral-100 border border-neutral-300"
                                      : "text-red-700 bg-red-50 border border-red-200"
                                  }`}
                                >
                                  {isPassed ? "Pass" : "Fail"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            {selectedStudent && subjects.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-neutral-200 mt-4">
                <button
                  type="button"
                  onClick={handleSelectNextStudent}
                  className="px-3 py-2 text-xs font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Next Student</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleSaveMarks}
                  disabled={saving}
                  className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving & Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Marks & Recalculate Result</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
