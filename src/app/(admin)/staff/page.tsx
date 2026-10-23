"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building,
  Briefcase,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
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
import StaffFormModal, { DEPARTMENT_OPTIONS } from "@/components/staff/StaffFormModal";
import StaffDetailsModal from "@/components/staff/StaffDetailsModal";
import StaffDeleteModal from "@/components/staff/StaffDeleteModal";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useAuth } from "@/context/AuthContext";

export default function StaffPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [viewingStaff, setViewingStaff] = useState<any | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch staff with server-side pagination, search, and filters
  const {
    data: staffList,
    metadata,
    loading,
    refetch,
  } = useFetch<any[]>("/staff", {
    params: {
      page,
      limit: 10,
      search: search || undefined,
      department: selectedDepartment !== "all" ? selectedDepartment : undefined,
      employment_status: selectedStatus !== "all" ? selectedStatus : undefined,
      employment_type: selectedType !== "all" ? selectedType : undefined,
    },
  });

  const handleDeleteConfirm = async () => {
    if (!deletingStaff) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/staff/${deletingStaff.id}`);
      toast.success(`Staff member "${deletingStaff.full_name}" deleted successfully`);
      setDeletingStaff(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete staff member");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDepartment("all");
    setSelectedStatus("all");
    setSelectedType("all");
    setPage(1);
  };

  const formatCurrency = (val: any) => {
    if (val === null || val === undefined || val === "") return "—";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const getDepartmentBadgeStyle = (dept: string) => {
    switch (dept) {
      case "Teaching / Academic":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Administration / Office":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Kitchen / Cleaning Services":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Support & Maintenance":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "Management":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const parseRoles = (rolesData: any): string[] => {
    if (Array.isArray(rolesData)) return rolesData;
    if (typeof rolesData === "string") {
      try {
        const parsed = JSON.parse(rolesData);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return rolesData.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return (
    <PermissionGuard permission="view_staff_manage">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <UserCheck className="text-neutral-900" size={26} />
            <span>Staff & Faculty Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Maintain institutional faculty profiles, departments, designations, service history, and additional roles.
          </p>
        </div>

        {hasPermission("add_update_staff") && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setIsAddOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-all font-semibold text-xs shadow-xs shrink-0"
          >
            <Plus size={16} />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Total Staff
              </span>
              <span className="text-xl font-extrabold text-neutral-900">
                {metadata?.totalOverall ?? (loading ? "—" : (staffList || []).length)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Currently Employed
              </span>
              <span className="text-xl font-extrabold text-neutral-900">
                {metadata?.totalCurrentStaff ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
              <AlertCircle size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Former Staff
              </span>
              <span className="text-xl font-extrabold text-neutral-900">
                {metadata?.totalFormerStaff ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
              <Building size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Departments
              </span>
              <span className="text-xl font-extrabold text-neutral-900">
                {DEPARTMENT_OPTIONS.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Box */}
            <div className="lg:col-span-5 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search by name, phone, email, designation..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>

            {/* Department Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              >
                <option value="all">All Departments</option>
                {DEPARTMENT_OPTIONS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              >
                <option value="all">All Status</option>
                <option value="Currently Employed">Currently Employed</option>
                <option value="Former Staff">Former Staff</option>
              </select>
            </div>

            {/* Employment Type Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              >
                <option value="all">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
          </div>

          {(search || selectedDepartment !== "all" || selectedStatus !== "all" || selectedType !== "all") && (
            <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500 font-medium">
                Filtering results by active parameters
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-neutral-700 hover:text-neutral-900 font-semibold underline flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80">
              <TableRow className="border-neutral-200/80">
                <TableHead className="w-12 text-center text-xs font-bold text-neutral-700 uppercase">#</TableHead>
                <TableHead className="text-xs font-bold text-neutral-700 uppercase">Staff Member</TableHead>
                <TableHead className="text-xs font-bold text-neutral-700 uppercase">Department</TableHead>
                <TableHead className="text-xs font-bold text-neutral-700 uppercase">Designation & Roles</TableHead>
                <TableHead className="text-xs font-bold text-neutral-700 uppercase">Status & Type</TableHead>
                <TableHead className="text-xs font-bold text-neutral-700 uppercase">Service Period</TableHead>
                <TableHead className="text-xs font-bold text-neutral-700 uppercase">Salary</TableHead>
                <TableHead className="text-right text-xs font-bold text-neutral-700 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableSkeletonRows rows={5} columns={8} />
              ) : !staffList || staffList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-neutral-500">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                        <Users size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-neutral-800">No staff members found</h3>
                        <p className="text-xs text-neutral-500">
                          {search || selectedDepartment !== "all" || selectedStatus !== "all" || selectedType !== "all"
                            ? "Try adjusting your search criteria or filter combinations."
                            : "Click 'Add Staff Member' above to create the first faculty record."}
                        </p>
                      </div>
                      {(search || selectedDepartment !== "all" || selectedStatus !== "all" || selectedType !== "all") && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                staffList.map((item: any, idx: number) => {
                  const roles = parseRoles(item.additional_roles);
                  const isCurrent = item.employment_status === "Currently Employed";
                  const startStr = formatDate(item.joining_date);
                  const endStr = isCurrent ? "Present" : formatDate(item.leaving_date);

                  return (
                    <TableRow key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* # SL */}
                      <TableCell className="text-center text-xs font-mono text-neutral-400">
                        {(page - 1) * 10 + idx + 1}
                      </TableCell>

                      {/* Staff Member Avatar & Name & Contacts */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 overflow-hidden flex items-center justify-center shrink-0">
                            {item.photo_url ? (
                              <img
                                src={item.photo_url}
                                alt={item.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-neutral-900 block truncate">
                              {item.full_name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500 truncate">
                              <span>{item.phone}</span>
                              {item.email && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{item.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getDepartmentBadgeStyle(
                            item.department
                          )}`}
                        >
                          {item.department}
                        </span>
                      </TableCell>

                      {/* Designation & Additional Roles */}
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-neutral-800 block">
                            {item.designation}
                          </span>
                          {roles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {roles.slice(0, 2).map((role) => (
                                <span
                                  key={role}
                                  className="inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200"
                                >
                                  {role}
                                </span>
                              ))}
                              {roles.length > 2 && (
                                <span className="text-[10px] text-neutral-400 font-semibold px-1">
                                  +{roles.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status & Type */}
                      <TableCell>
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCurrent
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                            }`}
                          >
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                            <span>{item.employment_status || "Currently Employed"}</span>
                          </span>
                          <span className="text-[11px] text-neutral-400 font-medium block">
                            {item.employment_type || "Full-Time"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Service Period */}
                      <TableCell>
                        <div className="text-xs text-neutral-700 font-medium">
                          {startStr ? (
                            <span>
                              {startStr} –{" "}
                              <span
                                className={
                                  isCurrent ? "text-emerald-700 font-bold" : "text-neutral-600"
                                }
                              >
                                {endStr}
                              </span>
                            </span>
                          ) : isCurrent ? (
                            <span className="text-emerald-700 font-bold">Present (Active)</span>
                          ) : (
                            <span>Until {endStr}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Salary */}
                      <TableCell className="text-xs font-semibold text-neutral-800">
                        {formatCurrency(item.salary)}
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingStaff(item)}
                            title="View Full Details"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          {hasPermission("add_update_staff") && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaff(item);
                                setIsAddOpen(true);
                              }}
                              title="Edit Staff Member"
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {hasPermission("delete_staff") && (
                            <button
                              type="button"
                              onClick={() => setDeletingStaff(item)}
                              title="Delete Staff Member"
                              className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
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

        {/* Pagination Bar */}
        {metadata && metadata.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-neutral-100 bg-neutral-50/50">
            <span className="text-xs text-neutral-500">
              Showing page <span className="font-bold text-neutral-800">{metadata.page}</span> of{" "}
              <span className="font-bold text-neutral-800">{metadata.totalPages}</span> (
              {metadata.total} total staff)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg">
                {page}
              </span>
              <button
                type="button"
                disabled={page >= metadata.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <StaffFormModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingStaff(null);
        }}
        onSuccess={() => {
          refetch();
        }}
        initialData={editingStaff}
      />

      <StaffDetailsModal
        isOpen={Boolean(viewingStaff)}
        onClose={() => setViewingStaff(null)}
        staff={viewingStaff}
        onEdit={(item) => {
          setEditingStaff(item);
          setIsAddOpen(true);
        }}
      />

      <StaffDeleteModal
        isOpen={Boolean(deletingStaff)}
        onClose={() => setDeletingStaff(null)}
        onConfirm={handleDeleteConfirm}
        staffName={deletingStaff?.full_name || ""}
        isDeleting={isDeleting}
      />
    </div>
    </PermissionGuard>
  );
}
