"use client";

import React, { useState } from "react";
import {
  Award,
  Plus,
  Search,
  BookOpen,
  Users,
  CheckCircle,
  FileSpreadsheet,
  Settings,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useFetch } from "@/hooks/useFetch";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import CreateEditExaminationModal from "@/components/examinations/CreateEditExaminationModal";
import SubjectConfigModal from "@/components/examinations/SubjectConfigModal";
import EligibilityManagementModal from "@/components/examinations/EligibilityManagementModal";
import MarksEntryModal from "@/components/examinations/MarksEntryModal";
import ClassMarkListModal from "@/components/examinations/ClassMarkListModal";

export default function ExaminationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);

  const [subjectConfigExam, setSubjectConfigExam] = useState<any | null>(null);
  const [eligibilityExam, setEligibilityExam] = useState<any | null>(null);
  const [marksEntryExam, setMarksEntryExam] = useState<any | null>(null);
  const [classListExam, setClassListExam] = useState<any | null>(null);

  const [deletingExam, setDeletingExam] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch examinations
  const { data: examinations, metadata, loading, refetch, error } = useFetch<any[]>("/examinations", {
    params: {
      page,
      limit: 12,
      search: search || undefined,
      academic_year: selectedYear || undefined,
      status: selectedStatus || undefined,
    },
  });

  const handleDeleteConfirm = async () => {
    if (!deletingExam) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/examinations/${deletingExam.id}`);
      toast.success("Examination cycle deleted successfully");
      setDeletingExam(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete examination");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublication = async (
    exam: any,
    field: "is_hall_ticket_published" | "is_result_published"
  ) => {
    const newVal = !exam[field];
    try {
      await apiClient.put(`/examinations/${exam.id}`, {
        [field]: newVal,
      });
      toast.success(
        `${field === "is_hall_ticket_published" ? "Hall Ticket" : "Result"} publication ${newVal ? "enabled" : "disabled"
        }`
      );
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle publication status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Standard Black and White */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Award className="text-neutral-900" size={24} />
            Examination Management System
          </h1>
          <p className="text-xs text-neutral-500">
            Create unified examination cycles, configure class-wise subjects, manage clearance, record marks, and publish results.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExam(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shrink-0 shadow-xs"
        >
          <Plus size={16} />
          <span>New Examination Cycle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border border-neutral-200 shadow-none">
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search examination name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-neutral-50/50"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-800"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Open">Open (Active)</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-800"
              >
                <option value="">All Academic Years</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedYear("");
                  setSelectedStatus("");
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Examination Cycles Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TableSkeleton rows={4} columns={3} />
          <TableSkeleton rows={4} columns={3} />
        </div>
      ) : !examinations || examinations.length === 0 ? (
        <Card className="p-12 text-center text-neutral-500 border border-dashed border-neutral-300 shadow-none">
          <Award size={40} className="mx-auto mb-2 text-neutral-300" />
          <h3 className="text-sm font-bold text-neutral-800">No Examination Cycles Found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Click "New Examination Cycle" above to create an academic examination event.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examinations.map((exam) => (
            <Card
              key={exam.id}
              className="bg-white border border-neutral-200 shadow-none overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Header - Black and White */}
                <div className="p-4 border-b border-neutral-200 bg-neutral-50/60 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">{exam.name}</span>
                      <Badge
                        variant={
                          exam.status === "Open"
                            ? "default"
                            : exam.status === "Completed"
                              ? "secondary"
                              : exam.status === "Draft"
                                ? "outline"
                                : "destructive"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {exam.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-800">{exam.exam_type}</span>
                      <span>•</span>
                      <span>{exam.academic_year}</span>
                      {exam.semester && (
                        <>
                          <span>•</span>
                          <span>{exam.semester}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingExam(exam);
                        setIsCreateOpen(true);
                      }}
                      title="Edit Examination Cycle"
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeletingExam(exam)}
                      title="Delete Examination Cycle"
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Card Details & Publication Toggles */}
                <div className="p-4 space-y-3.5 text-xs">
                  {/* Schedule dates */}
                  <div className="flex items-center gap-4 text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-neutral-400" />
                      <span>Start: <strong className="text-neutral-800">{exam.start_date || "Not set"}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-neutral-400" />
                      <span>End: <strong className="text-neutral-800">{exam.end_date || "Not set"}</strong></span>
                    </div>
                  </div>

                  {/* Publication toggles */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between p-2 rounded-md bg-neutral-50 border border-neutral-200">
                      <div>
                        <div className="font-semibold text-neutral-900 text-[11px]">Hall Tickets</div>
                        <div className="text-[10px] text-neutral-500">
                          {exam.is_hall_ticket_published ? "Published" : "Hidden"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePublication(exam, "is_hall_ticket_published")}
                        className="text-neutral-800 hover:text-black cursor-pointer"
                      >
                        {exam.is_hall_ticket_published ? (
                          <ToggleRight size={24} className="text-[#069116]" />
                        ) : (
                          <ToggleLeft size={24} className="text-neutral-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md bg-neutral-50 border border-neutral-200">
                      <div>
                        <div className="font-semibold text-neutral-900 text-[11px]">Exam Results</div>
                        <div className="text-[10px] text-neutral-500">
                          {exam.is_result_published ? "Published" : "Hidden"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePublication(exam, "is_result_published")}
                        className="text-neutral-800 hover:text-black cursor-pointer"
                      >
                        {exam.is_result_published ? (
                          <ToggleRight size={24} className="text-[#069116]" />
                        ) : (
                          <ToggleLeft size={24} className="text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Clean Neutral Buttons */}
              <div className="p-3 bg-neutral-50/50 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setSubjectConfigExam(exam)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-none"
                >
                  <BookOpen size={13} />
                  <span>Subjects</span>
                </button>

                <button
                  onClick={() => setEligibilityExam(exam)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-none"
                >
                  <Users size={13} />
                  <span>Eligibility</span>
                </button>

                <button
                  onClick={() => setMarksEntryExam(exam)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-none"
                >
                  <Award size={13} />
                  <span>Marks</span>
                </button>

                <button
                  onClick={() => setClassListExam(exam)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-none"
                >
                  <FileSpreadsheet size={13} />
                  <span>Results</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-4 sm:p-5 shadow-2xl border border-neutral-200 space-y-3 animate-in fade-in zoom-in-95">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900">Confirm Deletion</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to delete examination cycle{" "}
              <strong className="text-neutral-900">"{deletingExam.name}"</strong>?
              This will remove all associated marks and eligibility records for all classes.
            </p>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingExam(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md border border-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateEditExaminationModal
        isOpen={isCreateOpen}
        examination={editingExam}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingExam(null);
        }}
        onSuccess={() => refetch()}
      />

      <SubjectConfigModal
        isOpen={Boolean(subjectConfigExam)}
        examinationId={subjectConfigExam?.id || null}
        examinationName={subjectConfigExam?.name || ""}
        onClose={() => setSubjectConfigExam(null)}
        onUpdated={() => refetch()}
      />

      <EligibilityManagementModal
        isOpen={Boolean(eligibilityExam)}
        examinationId={eligibilityExam?.id || null}
        examinationName={eligibilityExam?.name || ""}
        onClose={() => setEligibilityExam(null)}
      />

      <MarksEntryModal
        isOpen={Boolean(marksEntryExam)}
        examinationId={marksEntryExam?.id || null}
        examinationName={marksEntryExam?.name || ""}
        onClose={() => setMarksEntryExam(null)}
        onUpdated={() => refetch()}
      />

      <ClassMarkListModal
        isOpen={Boolean(classListExam)}
        examinationId={classListExam?.id || null}
        examinationName={classListExam?.name || ""}
        onClose={() => setClassListExam(null)}
      />
    </div>
  );
}
