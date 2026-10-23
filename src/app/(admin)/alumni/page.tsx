"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  User,
  MapPin,
  Building,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
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
import AlumniFormModal, { POSITION_OPTIONS } from "@/components/alumni/AlumniFormModal";
import AlumniDetailsModal from "@/components/alumni/AlumniDetailsModal";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useAuth } from "@/context/AuthContext";

export default function AlumniPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedFeatured, setSelectedFeatured] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAlumnus, setEditingAlumnus] = useState<any | null>(null);
  const [viewingAlumnus, setViewingAlumnus] = useState<any | null>(null);
  const [deletingAlumnus, setDeletingAlumnus] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Fetch alumni
  const {
    data: alumniList,
    metadata,
    loading,
    refetch,
  } = useFetch<any[]>("/get_all_alumni", {
    params: {
      page,
      limit: 10,
      search: search || undefined,
      batch: selectedBatch !== "all" ? selectedBatch : undefined,
      is_featured: selectedFeatured !== "all" ? selectedFeatured : undefined,
    },
  });

  // Client-side filtering if position is selected or backend doesn't filter position
  const filteredAlumni = (alumniList || []).filter((item) => {
    if (selectedPosition === "all") return true;
    return item.current_position === selectedPosition;
  });

  // Unique batches for filter dropdown
  const uniqueBatches = Array.from(
    new Set((alumniList || []).map((a) => a.batch).filter(Boolean))
  );

  const handleToggleFeatured = async (alumnus: any) => {
    setTogglingId(alumnus.id);
    try {
      const res = await apiClient.patch(`/toggle_featured_alumni/${alumnus.id}`);
      const isNowFeatured = res.data?.data?.is_featured;
      toast.success(
        `${alumnus.full_name || alumnus.name} is now ${
          isNowFeatured ? "featured on public website" : "unfeatured"
        }`
      );
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update featured status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAlumnus) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/delete_alumni/${deletingAlumnus.id}`);
      toast.success(
        `Alumni ${deletingAlumnus.full_name || deletingAlumnus.name} deleted successfully`
      );
      setDeletingAlumnus(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete alumni");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedBatch("all");
    setSelectedFeatured("all");
    setSelectedPosition("all");
    setPage(1);
  };

  return (
    <PermissionGuard permission="view_alumni_manage">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground">Alumni Management</h1>
            {metadata && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {metadata.totalItems ?? metadata.total ?? filteredAlumni.length} Total
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage graduated students directory, track professional positions, and feature stories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors bg-white shadow-2xs"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {hasPermission("add_update_alumni") && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-all shadow-md shadow-primary/20 text-sm font-semibold cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Alumni</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              placeholder="Search by name, email, phone..."
              className="pl-9 pr-4 py-2 w-full border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
            >
              <option value="all">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <select
              value={selectedFeatured}
              onChange={(e) => {
                setSelectedFeatured(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
            >
              <option value="all">All Status (Featured / Standard)</option>
              <option value="true">Featured Alumni Only</option>
              <option value="false">Standard Profiles Only</option>
            </select>
          </div>

          {/* Position Category Filter */}
          <div>
            <select
              value={selectedPosition}
              onChange={(e) => {
                setSelectedPosition(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden truncate"
            >
              <option value="all">All Current Positions</option>
              {POSITION_OPTIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        {(search || selectedBatch !== "all" || selectedFeatured !== "all" || selectedPosition !== "all") && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
            <span>Filtering active results</span>
            <button
              onClick={handleResetFilters}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Table Card */}
      <Card className="border border-neutral-200/80 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[850px]">
              <TableHeader className="bg-neutral-50/70 border-b border-neutral-200">
                <TableRow>
                  <TableHead className="w-[70px] text-center">Photo</TableHead>
                  <TableHead>Alumni Info</TableHead>
                  <TableHead>Batch / Years</TableHead>
                  <TableHead>Current Engagement</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center w-[120px]">Featured</TableHead>
                  <TableHead className="text-right w-[110px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columns={7} rows={6} />
                ) : filteredAlumni && filteredAlumni.length > 0 ? (
                  filteredAlumni.map((alumnus: any) => {
                    const photo = alumnus.photo_url || alumnus.image || alumnus.photo;
                    const isFeatured = Boolean(alumnus.is_featured || alumnus.isFeatured);
                    const isTogglingThis = togglingId === alumnus.id;

                    return (
                      <TableRow key={alumnus.id} className="hover:bg-neutral-50/60 transition-colors">
                        {/* Avatar */}
                        <TableCell className="text-center py-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center mx-auto text-primary font-bold text-sm">
                            {photo ? (
                              <img
                                src={photo}
                                alt={alumnus.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} className="text-neutral-400" />
                            )}
                          </div>
                        </TableCell>

                        {/* Name & Contact */}
                        <TableCell className="py-3">
                          <div>
                            <p className="font-bold text-neutral-900 text-sm">
                              {alumnus.full_name || alumnus.name}
                            </p>
                            <div className="flex flex-col text-xs text-neutral-500 mt-0.5">
                              <span>{alumnus.email}</span>
                              <span className="text-[11px] text-neutral-400">{alumnus.phone}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Batch */}
                        <TableCell className="py-3">
                          <span className="inline-block px-2.5 py-0.5 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-md">
                            {alumnus.batch || "General"}
                          </span>
                          {alumnus.admission_year && alumnus.passed_year && (
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {alumnus.admission_year} – {alumnus.passed_year}
                            </p>
                          )}
                        </TableCell>

                        {/* Current Position & Dynamic Details */}
                        <TableCell className="py-3 max-w-xs">
                          <div>
                            <span className="text-xs font-semibold text-primary block truncate">
                              {alumnus.current_position || alumnus.profession || "Alumni"}
                            </span>
                            <div className="text-xs text-neutral-600 truncate mt-0.5">
                              {alumnus.designation && (
                                <span className="font-medium text-neutral-800 mr-1">
                                  {alumnus.designation}
                                </span>
                              )}
                              {(alumnus.organization || alumnus.institution_name || alumnus.business_name) && (
                                <span className="text-neutral-500">
                                  at {alumnus.organization || alumnus.institution_name || alumnus.business_name}
                                </span>
                              )}
                              {alumnus.course_name && (
                                <span className="text-neutral-500">
                                  ({alumnus.course_name})
                                </span>
                              )}
                              {alumnus.exam_name && (
                                <span className="text-neutral-500">
                                  Target: {alumnus.exam_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell className="py-3 text-xs text-neutral-600">
                          {alumnus.location ? (
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin size={13} className="text-amber-500 shrink-0" />
                              <span className="truncate">{alumnus.location}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </TableCell>

                        {/* Featured Toggle */}
                        <TableCell className="py-3 text-center">
                          <button
                            type="button"
                            disabled={!hasPermission("add_update_alumni") || isTogglingThis}
                            onClick={() => handleToggleFeatured(alumnus)}
                            className="inline-flex items-center gap-1 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              !hasPermission("add_update_alumni")
                                ? "No permission to update featured status"
                                : isFeatured
                                ? "Remove from Featured"
                                : "Add to Featured"
                            }
                          >
                            {isTogglingThis ? (
                              <Loader2 size={20} className="animate-spin text-neutral-400" />
                            ) : isFeatured ? (
                              <ToggleRight size={26} className="text-[#069116]" />
                            ) : (
                              <ToggleLeft size={26} className="text-neutral-300 hover:text-neutral-400" />
                            )}
                          </button>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingAlumnus(alumnus)}
                              className="p-1.5 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                              title="View Profile Details"
                            >
                              <Eye size={16} />
                            </button>
                            {hasPermission("add_update_alumni") && (
                              <button
                                onClick={() => setEditingAlumnus(alumnus)}
                                className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Alumni"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {hasPermission("delete_alumni") && (
                              <button
                                onClick={() => setDeletingAlumnus(alumnus)}
                                className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="Delete Alumni"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <GraduationCap className="mx-auto h-12 w-12 text-neutral-300 mb-2" />
                      <p className="text-sm font-semibold text-neutral-700">No alumni records found</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Try adjusting your search criteria or register a new alumnus.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      {metadata && metadata.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            Showing Page <span className="font-semibold text-neutral-800">{metadata.page || metadata.currentPage || page}</span> of{" "}
            <span className="font-semibold text-neutral-800">{metadata.totalPages}</span> (
            <span className="font-semibold text-neutral-800">{metadata.totalItems ?? metadata.total}</span> total records)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 font-semibold text-neutral-700">
              {page} / {metadata.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(metadata.totalPages, p + 1))}
              disabled={page === metadata.totalPages}
              className="p-2 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Alumni Modal */}
      <AlumniFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Alumni Modal */}
      <AlumniFormModal
        isOpen={Boolean(editingAlumnus)}
        onClose={() => setEditingAlumnus(null)}
        initialData={editingAlumnus}
        onSuccess={() => refetch()}
      />

      {/* View Alumni Details Modal */}
      <AlumniDetailsModal
        isOpen={Boolean(viewingAlumnus)}
        onClose={() => setViewingAlumnus(null)}
        alumnus={viewingAlumnus}
        onEdit={(al) => {
          setViewingAlumnus(null);
          setEditingAlumnus(al);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deletingAlumnus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Confirm Deletion</h3>
              <button
                onClick={() => setDeletingAlumnus(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-neutral-900">
                {deletingAlumnus.full_name || deletingAlumnus.name}
              </span>
              ? This action will permanently remove the record from the Alumni directory and public website.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAlumnus(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PermissionGuard>
  );
}
