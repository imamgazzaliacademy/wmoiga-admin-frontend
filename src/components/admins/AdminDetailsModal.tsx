"use client";

import React from "react";
import { X, Shield, User, Check, Ban, Calendar, UserCheck } from "lucide-react";
import { PERMISSION_REGISTRY, AdminUser } from "@/utils/permissions";

interface AdminDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: AdminUser | null;
}

export default function AdminDetailsModal({
    isOpen,
    onClose,
    admin,
}: AdminDetailsModalProps) {
    if (!isOpen || !admin) return null;

    const isSuperAdmin = admin.role === "super_admin";
    const permissions = admin.permissions || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[85vh] max-h-[750px] overflow-hidden animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-2xl font-bold">
                            {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">{admin.name}</h2>
                                <span
                                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                        admin.is_active !== false
                                            ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                                            : "bg-red-500/20 text-red-100 border border-red-400/30"
                                    }`}
                                >
                                    {admin.is_active !== false ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-white/80 text-sm font-mono mt-0.5">@{admin.username}</p>
                            <div className="flex items-center gap-3 text-xs text-white/70 mt-2">
                                <span className="inline-flex items-center gap-1">
                                    {isSuperAdmin ? <Shield size={14} /> : <User size={14} />}
                                    {isSuperAdmin ? "Super Administrator" : "Standard Administrator"}
                                </span>
                                {admin.createdAt && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar size={14} />
                                        Created {new Date(admin.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-5">
                    {/* Super Admin Notice */}
                    {isSuperAdmin ? (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-sm flex items-start gap-3">
                            <Shield className="text-purple-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold">Unconditional Full Privileges</h4>
                                <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                                    As a Super Administrator, this account has unrestricted access to all dashboard sections,
                                    database records, API operations, and administrator account management.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                Assigned Permissions Breakdown
                            </h3>

                            <div className="space-y-3">
                                {PERMISSION_REGISTRY.map((group) => {
                                    const grantedInGroup = group.permissions.filter(
                                        (p) => permissions[p.key] === true
                                    );
                                    const totalInGroup = group.permissions.length;

                                    return (
                                        <div
                                            key={group.id}
                                            className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                                        >
                                            <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs">
                                                <span className="font-semibold text-gray-900">
                                                    {group.name}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        grantedInGroup.length === totalInGroup
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : grantedInGroup.length > 0
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {grantedInGroup.length} of {totalInGroup} granted
                                                </span>
                                            </div>

                                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {group.permissions.map((perm) => {
                                                    const isGranted = !!permissions[perm.key];
                                                    return (
                                                        <div
                                                            key={perm.key}
                                                            className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                                                isGranted
                                                                    ? "bg-emerald-50/60 text-emerald-900 border border-emerald-200/60"
                                                                    : "bg-gray-50/40 text-gray-400 border border-gray-100"
                                                            }`}
                                                        >
                                                            {isGranted ? (
                                                                <Check
                                                                    size={14}
                                                                    className="text-emerald-600 shrink-0 stroke-[3]"
                                                                />
                                                            ) : (
                                                                <Ban
                                                                    size={14}
                                                                    className="text-gray-300 shrink-0"
                                                                />
                                                            )}
                                                            <span
                                                                className={
                                                                    isGranted
                                                                        ? "font-semibold text-gray-800"
                                                                        : "text-gray-400 line-through"
                                                                }
                                                            >
                                                                {perm.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200/70 rounded-xl transition-colors border border-gray-300 bg-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
