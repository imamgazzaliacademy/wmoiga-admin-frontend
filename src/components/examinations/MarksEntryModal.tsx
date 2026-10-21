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

  // Current marks being edited: subject_id -> { marks_obtained, is_absent }
  const [marksState, setMarksState] = useState<Record<number, { marks_obtained: number; is_absent: boolean }>>({});
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

    const initialMarks: Record<number, { marks_obtained: number; is_absent: boolean }> = {};
    if (std.marks && std.marks.length > 0) {
      std.marks.forEach((m: any) => {
        initialMarks[m.subject_id] = {
          marks_obtained: m.marks_obtained,
          is_absent: Boolean(m.is_absent),
        };
      });
    }

    setMarksState(initialMarks);
    const existingResult = std.results && std.results.length > 0 ? std.results[0] : null;
    setCalculatedResult(existingResult);
  }, [selectedStudentId, students]);

  const handleMarkChange = (subjectId: number, maxMarks: number, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setMarksState((prev) => ({
        ...prev,
        [subjectId]: { marks_obtained: 0, is_absent: prev[subjectId]?.is_absent || false },
      }));
      return;
    }

    if (num > maxMarks) {
      toast.warn(`Marks cannot exceed maximum marks (${maxMarks})`);
      return;
    }
    if (num < 0) {
      toast.warn("Marks cannot be negative");
      return;
    }

    setMarksState((prev) => ({
      ...prev,
      [subjectId]: { marks_obtained: num, is_absent: prev[subjectId]?.is_absent || false },
    }));
  };

  const handleToggleAbsent = (subjectId: number) => {
    setMarksState((prev) => {
      const current = prev[subjectId] || { marks_obtained: 0, is_absent: false };
      return {
        ...prev,
        [subjectId]: {
          marks_obtained: !current.is_absent ? 0 : current.marks_obtained,
          is_absent: !current.is_absent,
        },
      };
    });
  };

  const handleSaveMarks = async () => {
    if (!examinationId || !selectedStudentId) return;

    const marksPayload = subjects.map((subj) => {
      const subjKey = subj.subject_id || subj.id;
      const entry = marksState[subjKey] || { marks_obtained: 0, is_absent: false };
      return {
        subject_id: subjKey,
        marks_obtained: entry.is_absent ? 0 : entry.marks_obtained,
        is_absent: entry.is_absent,
      };
    });

    setSaving(true);
    try {
      const res = await apiClient.post(
        `/examinations/${examinationId}/marks/${selectedStudentId}`,
        { marks: marksPayload }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Award size={18} className="text-neutral-300" />
            <div>
              <h2 className="text-base font-bold">Marks Entry & Evaluation Workflow</h2>
              <p className="text-xs text-neutral-400">
                Examination: <span className="text-white font-semibold">{examinationName}</span>
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

        {/* Step 1 & 2: Class Selection */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Select Class:
            </span>
            <div className="flex flex-wrap gap-1">
              {SUPPORTED_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls.value;
                return (
                  <button
                    key={cls.value}
                    onClick={() => setSelectedClass(cls.value)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
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
            className="p-1 text-neutral-500 hover:text-neutral-900 border border-neutral-300 rounded hover:bg-neutral-100"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Workflow Body: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] max-h-[65vh] overflow-hidden">
          {/* Left Column: Student List for Selected Class */}
          <div className="lg:col-span-4 border-r border-neutral-200 p-4 flex flex-col gap-3 bg-neutral-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Students ({filteredStudents.length})
              </span>
              <span className="text-[11px] text-neutral-500">Class {selectedClass}</span>
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
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5 w-24">Max Marks</th>
                        <th className="p-2.5 w-24">Pass Marks</th>
                        <th className="p-2.5 w-28">Marks Obtained</th>
                        <th className="p-2.5 w-20 text-center">Absent</th>
                        <th className="p-2.5 w-20 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {subjects.map((subj) => {
                        const subjKey = subj.subject_id || subj.id;
                        const entry = marksState[subjKey] || { marks_obtained: 0, is_absent: false };
                        const isPassed = !entry.is_absent && entry.marks_obtained >= subj.pass_marks;

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
                              {subj.max_marks}
                            </td>

                            <td className="p-2.5 text-neutral-600">
                              {subj.pass_marks}
                            </td>

                            <td className="p-2.5">
                              <input
                                type="number"
                                disabled={entry.is_absent}
                                min={0}
                                max={subj.max_marks}
                                value={entry.marks_obtained}
                                onChange={(e) =>
                                  handleMarkChange(subjKey, subj.max_marks, e.target.value)
                                }
                                className="w-20 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 outline-none font-bold disabled:bg-neutral-100 text-neutral-900"
                              />
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
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-4">
                <button
                  type="button"
                  onClick={handleSelectNextStudent}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Student</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleSaveMarks}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
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
