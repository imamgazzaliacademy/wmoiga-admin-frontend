"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
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
import { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";
import CreateEditSubjectModal from "@/components/subjects/CreateEditSubjectModal";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useAuth } from "@/context/AuthContext";

export default function SubjectsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("manage_subjects");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch global subjects
  const { data: subjects, metadata, loading, refetch, error } = useFetch<any[]>("/subjects", {
    params: {
      page,
      limit: 15,
      search: search || undefined,
      class_name: selectedClass === "all" ? undefined : selectedClass,
      status: selectedStatus || undefined,
    },
  });

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/subjects/${deletingSubject.id}`);
      toast.success(`Subject "${deletingSubject.name}" deleted successfully`);
      setDeletingSubject(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete subject");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (subj: any) => {
    if (!canManage) return;
    const newStatus = subj.status === "Active" ? "Inactive" : "Active";
    try {
      await apiClient.put(`/subjects/${subj.id}`, { status: newStatus });
      toast.success(`Subject status updated to ${newStatus}`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subject status");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedClass("all");
    setSelectedStatus("");
    setPage(1);
  };

  const formatClasses = (ac: any) => {
    let classes: string[] = [];
    if (Array.isArray(ac)) {
      classes = ac;
    } else if (typeof ac === "string") {
      try {
        classes = JSON.parse(ac);
      } catch {
        classes = ac.split(",").map((c: string) => c.trim()).filter(Boolean);
      }
    }
    if (classes.length === 0) return <span className="text-neutral-400 italic">None</span>;
    if (classes.length === SUPPORTED_CLASSES.length) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300">
          All Classes
        </span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1">
        {classes.map((cls) => (
          <span
            key={cls}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200"
          >
            {cls}
          </span>
        ))}
      </div>
    );
  };

  return (
    <PermissionGuard permission="view_subjects">
      <div className="space-y-6">
        {/* Header - Black and White Design System */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <BookOpen className="text-neutral-900" size={24} />
              Subject Management
            </h1>
            <p className="text-xs text-neutral-500">
              Define global academic subjects, assign eligible classes, and reuse them across examination cycles.
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => {
                setEditingSubject(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shrink-0 shadow-xs"
            >
              <Plus size={16} />
              <span>Add New Subject</span>
            </button>
          )}
        </div>


      {/* Class-Wise Navigation Tabs */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Filter by Class Eligibility
        </div>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/80 rounded-lg border border-neutral-200">
          <button
            onClick={() => {
              setSelectedClass("all");
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedClass === "all"
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
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isSelected
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by subject name or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-neutral-50/50"
              />
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

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Subjects Data Table */}
      <Card className="bg-white border border-neutral-200 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table className="min-w-[650px] whitespace-nowrap">
            <TableHeader className="bg-neutral-50 border-b border-neutral-200">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Applicable Classes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows rows={8} columns={6} />
              ) : !subjects || subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-44 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Layers size={32} className="text-neutral-300" />
                      <p className="font-semibold text-xs text-neutral-800">
                        {selectedClass !== "all"
                          ? `No subjects assigned to ${SUPPORTED_CLASSES.find((c) => c.value === selectedClass)?.label || selectedClass}`
                          : "No global subjects found"}
                      </p>
                      <p className="text-[11px] text-neutral-400 max-w-sm">
                        {search || selectedStatus
                          ? "Try clearing filters to find subjects."
                          : "Click 'Add New Subject' to create course modules for your academic curricula."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subj, idx) => (
                  <TableRow key={subj.id} className="hover:bg-neutral-50/60 border-b border-neutral-100 transition-colors">
                    <TableCell className="text-xs text-neutral-500 font-mono">
                      {(page - 1) * 15 + idx + 1}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-neutral-900">{subj.name}</div>
                    </TableCell>

                    <TableCell>
                      {subj.code ? (
                        <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {subj.code}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {formatClasses(subj.applicable_classes)}
                    </TableCell>

                    <TableCell>
                      {canManage ? (
                        <button
                          onClick={() => handleToggleStatus(subj)}
                          title="Click to toggle status"
                          className="cursor-pointer"
                        >
                          <Badge
                            variant={subj.status === "Active" ? "default" : "secondary"}
                            className="text-[10px] px-2 py-0"
                          >
                            {subj.status}
                          </Badge>
                        </button>
                      ) : (
                        <Badge
                          variant={subj.status === "Active" ? "default" : "secondary"}
                          className="text-[10px] px-2 py-0"
                        >
                          {subj.status}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {canManage ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingSubject(subj);
                              setIsModalOpen(true);
                            }}
                            title="Edit Subject"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => setDeletingSubject(subj)}
                            title="Delete Subject"
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">View only</span>
                      )}
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
                <span className="font-semibold text-neutral-900">{metadata.totalPages}</span> ({metadata.totalItems || metadata.total} total subjects)
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
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-4 sm:p-5 shadow-2xl border border-neutral-200 space-y-3 animate-in fade-in zoom-in-95">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900">Confirm Subject Deletion</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete subject{" "}
              <span className="font-bold text-neutral-900">"{deletingSubject.name}"</span>?
            </p>
            <p className="text-[11px] text-neutral-500">
              Note: If this subject is referenced in any examination configurations or marks, deletion will be safely rejected to preserve academic integrity. You can mark it as Inactive instead.
            </p>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingSubject(null)}
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
                {isDeleting ? "Deleting..." : "Delete Subject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <CreateEditSubjectModal
        isOpen={isModalOpen}
        subject={editingSubject}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
      </div>
    </PermissionGuard>
  );
}

