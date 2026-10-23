"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck,
    UserPlus,
    Search,
    Shield,
    User,
    Eye,
    Pencil,
    Trash2,
    Copy,
    Check,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";
import PermissionGuard from "@/components/auth/PermissionGuard";
import AdminFormModal from "@/components/admins/AdminFormModal";
import AdminDetailsModal from "@/components/admins/AdminDetailsModal";
import AdminDeleteModal from "@/components/admins/AdminDeleteModal";
import AdminCreatedModal from "@/components/admins/AdminCreatedModal";
import { AdminUser, ALL_PERMISSION_KEYS } from "@/utils/permissions";
import { useAuth } from "@/context/AuthContext";

export default function AdminsPage() {
    const { user: currentUser } = useAuth();

    // Data state
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [summary, setSummary] = useState({
        totalOverall: 0,
        totalSuperAdmins: 0,
        totalStandardAdmins: 0,
        totalActiveAdmins: 0,
    });

    // Session cache of credentials created in this browser session
    const [sessionCreatedCredentials, setSessionCreatedCredentials] = useState<
        Record<string, { username: string; password: string; name: string; role: string }>
    >({});
    const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminUser | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedAdminForDetails, setSelectedAdminForDetails] = useState<AdminUser | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAdminForDelete, setSelectedAdminForDelete] = useState<AdminUser | null>(null);

    // One-time credential modal state
    const [isCreatedModalOpen, setIsCreatedModalOpen] = useState(false);
    const [latestCreatedCredentials, setLatestCreatedCredentials] = useState<{
        name: string;
        username: string;
        password: string;
        role: string;
    } | null>(null);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const params = new URLSearchParams({
                page: String(page),
                limit: "10",
                search,
                role: roleFilter,
                status: statusFilter,
            });

            const res = await fetch(`/api/admins?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setAdmins(data.admins || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems || 0);
                if (data.summary) {
                    setSummary(data.summary);
                }
            } else {
                toast.error(data.message || "Failed to load admin accounts");
            }
        } catch (err) {
            console.error("Fetch admins error:", err);
            toast.error("Error loading admin accounts");
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter, statusFilter]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // Handle Copy Credentials
    const handleCopyCredentials = async (adminUsername: string) => {
        const cred = sessionCreatedCredentials[adminUsername];
        if (!cred) {
            toast.info("Password was securely cleared. Use 'Edit Admin' to reset password if needed.");
            return;
        }

        const copyText = `Username: ${cred.username}\nPassword: ${cred.password}`;
        try {
            await navigator.clipboard.writeText(copyText);
            setCopiedUsername(adminUsername);
            toast.success(`Credentials copied for ${cred.username}`);
            setTimeout(() => setCopiedUsername(null), 3000);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <PermissionGuard superAdminOnly>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                                Super Admin Only
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage administrator accounts, assign roles, and configure granular permissions
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedAdminForEdit(null);
                            setIsFormOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md shrink-0"
                    >
                        <UserPlus size={18} />
                        Add Administrator
                    </button>
                </div>

                {/* Summary Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total Admins
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-gray-900">
                            {summary.totalOverall}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                                Super Admins
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Shield size={18} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-purple-700">
                            {summary.totalSuperAdmins}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                Standard Admins
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <User size={18} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-blue-700">
                            {summary.totalStandardAdmins}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                Active Accounts
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-emerald-700">
                            {summary.totalActiveAdmins}
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search administrators by name or username..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Standard Admin</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Admin Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                                    <th className="py-3.5 px-4">Role</th>
                                    <th className="py-3.5 px-4">Permissions Access</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Created Date</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    // Skeletons
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                                    <div className="space-y-1.5">
                                                        <div className="h-4 w-32 bg-gray-200 rounded" />
                                                        <div className="h-3 w-20 bg-gray-200 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-4 w-32 bg-gray-200 rounded" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-4 w-24 bg-gray-200 rounded" />
                                            </td>
                                            <td className="py-4 px-4 sm:px-6 text-right">
                                                <div className="h-8 w-24 bg-gray-200 rounded ml-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                <Users size={24} />
                                            </div>
                                            <p className="font-semibold text-gray-700">No administrators found</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Try adjusting your search criteria or filters
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((adm) => {
                                        const isSuper = adm.role === "super_admin";
                                        const isSelf = currentUser?.id === adm.id;
                                        const grantedCount = Object.values(adm.permissions || {}).filter(
                                            Boolean
                                        ).length;
                                        const hasSessionCred = !!sessionCreatedCredentials[adm.username];

                                        return (
                                            <tr
                                                key={adm.id}
                                                className="hover:bg-gray-50/70 transition-colors"
                                            >
                                                {/* Administrator */}
                                                <td className="py-3.5 px-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                                                isSuper
                                                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                                    : "bg-primary/10 text-primary border border-primary/20"
                                                            }`}
                                                        >
                                                            {adm.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                                                <span>{adm.name}</span>
                                                                {isSelf && (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-normal">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">
                                                                @{adm.username}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            isSuper
                                                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                                : "bg-blue-100 text-blue-700 border border-blue-200"
                                                        }`}
                                                    >
                                                        {isSuper ? <Shield size={13} /> : <User size={13} />}
                                                        {isSuper ? "Super Admin" : "Admin"}
                                                    </span>
                                                </td>

                                                {/* Permissions */}
                                                <td className="py-3.5 px-4">
                                                    {isSuper ? (
                                                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                            Full Access (Unrestricted)
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-600">
                                                            <strong className="text-gray-900">
                                                                {grantedCount}
                                                            </strong>{" "}
                                                            of {ALL_PERMISSION_KEYS.length} granted
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                            adm.is_active !== false
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : "bg-red-50 text-red-600 border border-red-200"
                                                        }`}
                                                    >
                                                        {adm.is_active !== false ? (
                                                            <CheckCircle2 size={13} />
                                                        ) : (
                                                            <XCircle size={13} />
                                                        )}
                                                        {adm.is_active !== false ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* Created At */}
                                                <td className="py-3.5 px-4 text-xs text-gray-500">
                                                    {adm.createdAt
                                                        ? new Date(adm.createdAt).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 sm:px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Copy Credentials button (only for accounts created in current session) */}
                                                        {hasSessionCred && (
                                                            <button
                                                                onClick={() => handleCopyCredentials(adm.username)}
                                                                title="Copy Credentials"
                                                                className={`p-1.5 rounded-lg border transition-colors ${
                                                                    copiedUsername === adm.username
                                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                                                }`}
                                                            >
                                                                {copiedUsername === adm.username ? (
                                                                    <Check size={15} />
                                                                ) : (
                                                                    <Copy size={15} />
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* View Details */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAdminForDetails(adm);
                                                                setIsDetailsOpen(true);
                                                            }}
                                                            title="View Permissions Breakdown"
                                                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAdminForEdit(adm);
                                                                setIsFormOpen(true);
                                                            }}
                                                            title="Edit Administrator"
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAdminForDelete(adm);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                            disabled={isSelf}
                                                            title={isSelf ? "Cannot delete self" : "Delete Administrator"}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div>
                                Showing {(page - 1) * 10 + 1} to{" "}
                                {Math.min(page * 10, totalItems)} of {totalItems} administrators
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="px-3 font-semibold text-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create / Edit Modal */}
                <AdminFormModal
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedAdminForEdit(null);
                    }}
                    onSuccess={(createdCreds) => {
                        setIsFormOpen(false);
                        setSelectedAdminForEdit(null);
                        fetchAdmins();

                        if (createdCreds) {
                            // Save to session cache
                            setSessionCreatedCredentials((prev) => ({
                                ...prev,
                                [createdCreds.username]: createdCreds,
                            }));
                            // Open dedicated one-time copy modal
                            setLatestCreatedCredentials(createdCreds);
                            setIsCreatedModalOpen(true);
                        }
                    }}
                    admin={selectedAdminForEdit}
                />

                {/* One-Time Credential Modal */}
                <AdminCreatedModal
                    isOpen={isCreatedModalOpen}
                    onClose={() => {
                        setIsCreatedModalOpen(false);
                        setLatestCreatedCredentials(null);
                    }}
                    credentials={latestCreatedCredentials}
                />

                {/* Details Modal */}
                <AdminDetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => {
                        setIsDetailsOpen(false);
                        setSelectedAdminForDetails(null);
                    }}
                    admin={selectedAdminForDetails}
                />

                {/* Delete Confirmation Modal */}
                <AdminDeleteModal
                    isOpen={isDeleteOpen}
                    onClose={() => {
                        setIsDeleteOpen(false);
                        setSelectedAdminForDelete(null);
                    }}
                    onSuccess={() => {
                        setIsDeleteOpen(false);
                        setSelectedAdminForDelete(null);
                        fetchAdmins();
                    }}
                    admin={selectedAdminForDelete}
                />
            </div>
        </PermissionGuard>
    );
}
