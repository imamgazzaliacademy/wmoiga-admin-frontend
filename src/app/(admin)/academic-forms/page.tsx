"use client";

import React, { useState, useRef } from "react";
import {
  FileDown,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  UploadCloud,
  FileText,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  File,
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
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useAuth } from "@/context/AuthContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export interface AcademicFormItem {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string;
  createdAt: string;
  updatedAt: string;
  download_url?: string;
}

export default function AcademicFormsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("manage_academic_forms");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<AcademicFormItem | null>(null);
  const [deletingForm, setDeletingForm] = useState<AcademicFormItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Editor state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch academic forms list
  const { data: forms, metadata, loading, refetch } = useFetch<AcademicFormItem[]>("/academic-forms", {
    params: {
      page,
      limit: 10,
      search: search || undefined,
    },
  });

  const openCreateModal = () => {
    setEditingForm(null);
    setFormTitle("");
    setFormDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const openEditModal = (item: AcademicFormItem) => {
    setEditingForm(item);
    setFormTitle(item.title);
    setFormDescription(item.description || "");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingForm(null);
    setFormTitle("");
    setFormDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Invalid file type. Only PDF, DOC, and DOCX files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 10 MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error("Form title is required.");
      return;
    }

    if (!editingForm && !selectedFile) {
      toast.error("Please select a file to upload (PDF, DOC, or DOCX).");
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", formTitle.trim());
      if (formDescription.trim()) {
        payload.append("description", formDescription.trim());
      } else {
        payload.append("description", "");
      }

      if (selectedFile) {
        payload.append("attachment", selectedFile);
      }

      if (editingForm) {
        await apiClient.put(`/academic-forms/${editingForm.id}`, payload);
        toast.success(`Form "${formTitle.trim()}" updated successfully.`);
      } else {
        await apiClient.post("/academic-forms", payload);
        toast.success(`Form "${formTitle.trim()}" created successfully.`);
      }

      closeModal();
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to save academic form."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingForm) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/academic-forms/${deletingForm.id}`);
      toast.success(`Form "${deletingForm.title}" deleted successfully.`);
      setDeletingForm(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete form.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || isNaN(bytes)) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatBadge = (fileType: string) => {
    const ft = (fileType || "").toLowerCase();
    if (ft === "pdf") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
          PDF
        </span>
      );
    }
    if (ft === "doc" || ft === "docx") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          DOCX
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-200">
        {ft.toUpperCase()}
      </span>
    );
  };

  return (
    <PermissionGuard permission="view_academic_forms">
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0d3b2e]/10 text-[#0d3b2e] flex items-center justify-center font-bold">
                <FileDown size={18} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Forms Download Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Manage downloadable academic and administrative blank forms for students.
            </p>
          </div>

          {canManage && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0d3b2e] hover:bg-[#0d3b2e]/90 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Add New Form</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <Card className="border-neutral-200 shadow-xs">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Search forms by title or description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0d3b2e]/20 focus:border-[#0d3b2e] transition-all"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => refetch()}
                  title="Refresh list"
                  className="p-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Table */}
        <Card className="border-neutral-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50/80">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-bold text-neutral-700">#</TableHead>
                    <TableHead className="min-w-[200px] text-xs font-bold text-neutral-700">Form Details</TableHead>
                    <TableHead className="w-32 text-xs font-bold text-neutral-700">Format & Size</TableHead>
                    <TableHead className="w-36 text-xs font-bold text-neutral-700">Created Date</TableHead>
                    <TableHead className="w-36 text-right text-xs font-bold text-neutral-700 pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeletonRows rows={5} columns={5} />
                  ) : !forms || forms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-neutral-400">
                        <FileDown size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium text-neutral-600">No academic forms found</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {search ? "Try adjusting your search criteria" : "Click 'Add New Form' above to upload an academic form."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    forms.map((item, index) => {
                      const displayIndex = ((metadata?.currentPage || page) - 1) * (metadata?.limit || 10) + index + 1;
                      const sizeStr = formatFileSize(item.file_size);
                      const formattedDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "—";

                      return (
                        <TableRow key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                          <TableCell className="text-center text-xs font-mono text-neutral-500">
                            {displayIndex}
                          </TableCell>

                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-neutral-900 text-sm flex items-center gap-1.5">
                                <FileText size={15} className="text-[#0d3b2e] shrink-0" />
                                <span>{item.title}</span>
                              </div>
                              {item.description ? (
                                <p className="text-xs text-neutral-500 line-clamp-2 max-w-xl">
                                  {item.description}
                                </p>
                              ) : (
                                <span className="text-[11px] text-neutral-400 italic">No description provided</span>
                              )}
                              <div className="text-[11px] text-neutral-400 font-mono truncate max-w-sm">
                                {item.file_name}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              {getFormatBadge(item.file_type)}
                              {sizeStr && (
                                <div className="text-[11px] text-neutral-500 font-mono">{sizeStr}</div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs text-neutral-600">{formattedDate}</span>
                          </TableCell>

                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Direct Download Button */}
                              <a
                                href={`/api/academic-forms/${item.id}/download`}
                                download
                                target="_blank"
                                rel="noreferrer"
                                title="Download Blank Form"
                                className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-md transition-colors"
                              >
                                <Download size={15} />
                              </a>

                              {canManage && (
                                <>
                                  <button
                                    onClick={() => openEditModal(item)}
                                    title="Edit Form"
                                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Pencil size={15} />
                                  </button>

                                  <button
                                    onClick={() => setDeletingForm(item)}
                                    title="Delete Form"
                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {metadata && metadata.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-neutral-200 bg-neutral-50/50 text-xs text-neutral-600">
                <div className="text-center sm:text-left">
                  Showing page <span className="font-semibold text-neutral-900">{metadata.currentPage || metadata.page}</span> of{" "}
                  <span className="font-semibold text-neutral-900">{metadata.totalPages}</span> ({metadata.totalItems || metadata.total} forms total)
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1 border border-neutral-300 rounded hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-2 font-medium">Page {page}</span>
                  <button
                    disabled={page >= metadata.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1 border border-neutral-300 rounded hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {deletingForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-xl p-4 sm:p-5 shadow-2xl border border-neutral-200 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertCircle size={20} />
                <h3 className="text-base font-bold text-neutral-900">Confirm Form Deletion</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-neutral-900">"{deletingForm.title}"</span>?
              </p>
              <p className="text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                This action will delete the form record and remove the attached file ({deletingForm.file_name}) permanently from storage.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingForm(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md border border-neutral-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Form"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#0d3b2e]/10 text-[#0d3b2e] flex items-center justify-center">
                    <FileDown size={16} />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900">
                    {editingForm ? "Edit Academic Form" : "Add New Academic Form"}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">
                    Form Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Transfer Certificate (TC) Application, Medical Leave Form"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0d3b2e]/20 focus:border-[#0d3b2e]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">
                    Description <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description, instructions for students, or submission guidelines..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0d3b2e]/20 focus:border-[#0d3b2e]"
                  />
                </div>

                {/* Attachment Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                    <span>
                      Attachment File {!editingForm && <span className="text-red-500">*</span>}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-normal">PDF or DOC/DOCX (Max 10 MB)</span>
                  </label>

                  {/* Show existing file info if editing */}
                  {editingForm && !selectedFile && (
                    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-[#0d3b2e] shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-neutral-800">{editingForm.file_name}</span>
                          {editingForm.file_size && (
                            <span className="text-neutral-400 text-[11px] ml-1.5 font-mono">
                              ({formatFileSize(editingForm.file_size)})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">
                        Current File
                      </span>
                    </div>
                  )}

                  {/* File selector input */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${selectedFile
                        ? "border-[#0d3b2e] bg-[#0d3b2e]/5"
                        : "border-neutral-300 hover:border-[#0d3b2e]/60 hover:bg-neutral-50"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0d3b2e]">
                          <File size={16} />
                          <span>{selectedFile.name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {formatFileSize(selectedFile.size)} • Click to choose a different file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud size={24} className="mx-auto text-neutral-400" />
                        <p className="text-xs font-medium text-neutral-700">
                          {editingForm ? "Click to replace attachment" : "Click or drag to upload blank form"}
                        </p>
                        <p className="text-[11px] text-neutral-400">PDF, DOC, or DOCX up to 10 MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg border border-neutral-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0d3b2e] hover:bg-[#0d3b2e]/90 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving
                      ? editingForm
                        ? "Updating..."
                        : "Uploading..."
                      : editingForm
                        ? "Update Form"
                        : "Save & Publish Form"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
