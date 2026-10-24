"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  GraduationCap,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { useFetch } from "@/hooks/useFetch";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { adminApi } from "@/store/api/adminApi";
import StudentRegistrationModal, { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";
import StudentEditModal from "@/components/students/StudentEditModal";
import StudentProfileModal from "@/components/students/StudentProfileModal";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useAuth } from "@/context/AuthContext";

export default function StudentsPage() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<number | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentClassLabel =
    SUPPORTED_CLASSES.find((c) => c.value === selectedClass)?.label ||
    (selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`);

  const handleExportToExcel = async () => {
    if (!selectedClass || selectedClass === "all") {
      toast.warning("Please select a specific class from the tabs above to export students.");
      return;
    }

    const loadingToast = toast.loading(`Preparing Excel file for ${currentClassLabel}...`);
    setIsExporting(true);

    try {
      const response = await apiClient.get<Blob>("/students/export", {
        params: {
          class_name: selectedClass,
        },
        responseType: "blob",
      });

      const cleanClass = selectedClass.replace(/^Class\s+/i, "").replace(/[^a-zA-Z0-9_+]/g, "_");
      const filename = `Students_Class_${cleanClass}.xlsx`;

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.update(loadingToast, {
        render: `Successfully exported students for ${currentClassLabel}!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      console.error("Failed to export students", err);
      let errorMsg = "Failed to export students data.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMsg = json.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.update(loadingToast, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch students using useFetch hook
  const { data: students, metadata, loading, refetch, error } = useFetch<any[]>("/students", {
    params: {
      page,
      limit: 10,
      search: search || undefined,
      year: selectedYear || undefined,
      class_name: selectedClass === "all" ? undefined : selectedClass,
      status: selectedStatus || undefined,
    },
  });

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/students/${deletingStudent.id}`);
      dispatch(adminApi.util.invalidateTags([{ type: 'Students', id: 'LIST' }]));
      toast.success(`Student ${deletingStudent.full_name} deleted successfully`);
      setDeletingStudent(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedYear("");
    setSelectedStatus("");
    setPage(1);
  };

  return (
    <PermissionGuard permission="view_students_manage">
    <div className="space-y-6">
      {/* Header - Standard Black and White */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <GraduationCap className="text-neutral-900" size={24} />
            Student Management System
          </h1>
          <p className="text-xs text-neutral-500">
            Maintain student records, class enrollments, unique sequence numbering, and examination profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleExportToExcel}
            disabled={isExporting || !selectedClass || selectedClass === "all"}
            title={
              !selectedClass || selectedClass === "all"
                ? "Please select a specific class from the tabs below to export students"
                : `Export all students in ${currentClassLabel} to Excel`
            }
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold border transition-all shrink-0 shadow-xs ${
              !selectedClass || selectedClass === "all"
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:border-emerald-300"
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet
                  size={15}
                  className={!selectedClass || selectedClass === "all" ? "text-neutral-400" : "text-emerald-600"}
                />
                <span>
                  {selectedClass && selectedClass !== "all"
                    ? `Export to Excel (${currentClassLabel})`
                    : "Export to Excel"}
                </span>
              </>
            )}
          </button>

          {hasPermission("add_update_student") && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shrink-0 shadow-xs"
            >
              <Plus size={16} />
              <span>Register New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Selection Navigation Buttons / Tabs */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Class-Wise Navigation
        </div>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/80 rounded-lg border border-neutral-200">
          <button
            onClick={() => {
              setSelectedClass("all");
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${selectedClass === "all"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
              }`}
          >
            All Classes
          </button>

          {SUPPORTED_CLASSES.map((cls) => {
            const isSelected = selectedClass === cls.value;
            return (
              <button
                key={cls.value}
                onClick={() => {
                  setSelectedClass(cls.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${isSelected
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
                  }`}
              >
                {cls.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border border-neutral-200 shadow-none">
        <CardContent className="p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by admission no, name, place, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-neutral-50/50"
              />
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-800"
              >
                <option value="">All Admission Batches</option>
                {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                  <option key={yr} value={yr}>
                    Batch {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-800"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-center">
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Students Data Table */}
      <Card className="bg-white border border-neutral-200 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table className="min-w-[850px] whitespace-nowrap">
            <TableHeader className="bg-neutral-50 border-b border-neutral-200">
              <TableRow>
                <TableHead className="w-14">Photo</TableHead>
                <TableHead>Admission No</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows rows={8} columns={9} />
              ) : !students || students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-44 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users size={32} className="text-neutral-300" />
                      <p className="font-semibold text-xs text-neutral-800">
                        {selectedClass !== "all"
                          ? `No student records found in ${SUPPORTED_CLASSES.find((c) => c.value === selectedClass)?.label || selectedClass}`
                          : "No student records found"}
                      </p>
                      <p className="text-[11px] text-neutral-400 max-w-sm">
                        {search || selectedYear || selectedStatus
                          ? "Try adjusting your search query or clearing the applied filters."
                          : "Click 'Register New Student' above to enroll a student in this class."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-neutral-50/60 border-b border-neutral-100 transition-colors">
                    <TableCell>
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] font-bold text-neutral-400">
                            {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {student.admission_number}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-neutral-900">{student.full_name}</div>
                      {student.place && <div className="text-[10px] text-neutral-500">{student.place}</div>}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-neutral-800">{student.class_name}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-neutral-600 font-medium">{student.admission_year ? `${student.admission_year}/${String(student.admission_year + 1).slice(-2)}` : "N/A"}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-neutral-600">{student.date_of_birth}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-neutral-600 font-mono">
                        {student.guardian_contact || student.alt_phone || "-"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          student.status === "Active"
                            ? "default"
                            : student.status === "Graduated"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-[10px] px-2 py-0"
                      >
                        {student.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudentId(student.id)}
                          title="View Profile"
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                        >
                          <Eye size={15} />
                        </button>

                        {hasPermission("add_update_student") && (
                          <button
                            onClick={() => setEditingStudent(student)}
                            title="Edit Student"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {hasPermission("delete_student") && (
                          <button
                            onClick={() => setDeletingStudent(student)}
                            title="Delete Student"
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {metadata && metadata.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-neutral-200 bg-neutral-50/50 text-xs text-neutral-600">
              <div className="text-center sm:text-left">
                Showing page <span className="font-semibold text-neutral-900">{metadata.currentPage || metadata.page}</span> of{" "}
                <span className="font-semibold text-neutral-900">{metadata.totalPages}</span> ({metadata.totalItems || metadata.total} total students)
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1 border border-neutral-300 rounded hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-2 font-medium">Page {page}</span>
                <button
                  disabled={page >= metadata.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 border border-neutral-300 rounded hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-4 sm:p-5 shadow-2xl border border-neutral-200 space-y-3 animate-in fade-in zoom-in-95">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900">Confirm Deletion</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to delete student{" "}
              <span className="font-bold text-neutral-900">{deletingStudent.full_name}</span> (Admission No:{" "}
              <span className="font-mono font-bold">{deletingStudent.admission_number}</span>)? This will permanently remove their records.
            </p>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
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
      <StudentRegistrationModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => refetch()}
      />

      <StudentEditModal
        isOpen={Boolean(editingStudent)}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={() => refetch()}
      />

      <StudentProfileModal
        isOpen={Boolean(viewingStudentId)}
        studentId={viewingStudentId}
        onClose={() => setViewingStudentId(null)}
      />
    </div>
    </PermissionGuard>
  );
}
