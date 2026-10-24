"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Sparkles, Shield, User, Check, UserPlus, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import { PERMISSION_REGISTRY, ALL_PERMISSION_KEYS, AdminUser } from "@/utils/permissions";

interface AdminFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (createdCredentials?: { name: string; username: string; password: string; role: string }) => void;
    admin: AdminUser | null;
}

export default function AdminFormModal({
    isOpen,
    onClose,
    onSuccess,
    admin,
}: AdminFormModalProps) {
    const isEdit = !!admin;

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<"super_admin" | "admin">("admin");
    const [isActive, setIsActive] = useState(true);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<"account" | "permissions">("account");

    useEffect(() => {
        if (admin) {
            setName(admin.name || "");
            setUsername(admin.username || "");
            setPassword("");
            setRole(admin.role || "admin");
            setIsActive(admin.is_active !== false);
            setPermissions(admin.permissions || {});
        } else {
            setName("");
            setUsername("");
            setPassword("");
            setRole("admin");
            setIsActive(true);
            // Default all permissions to false
            const initial: Record<string, boolean> = {};
            ALL_PERMISSION_KEYS.forEach((key) => {
                initial[key] = false;
            });
            setPermissions(initial);
        }
        setErrors({});
        setActiveTab("account");
    }, [admin, isOpen]);

    if (!isOpen) return null;

    const selectedCount =
        role === "super_admin"
            ? ALL_PERMISSION_KEYS.length
            : Object.values(permissions).filter(Boolean).length;

    const generateRandomPassword = () => {
        const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
        let generated = "";
        for (let i = 0; i < 12; i++) {
            generated += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(generated);
        setShowPassword(true);
        toast.info("Generated a secure random password!");
    };

    const handleTogglePermission = (key: string) => {
        if (role === "super_admin") return;
        setPermissions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleToggleGroup = (groupKeys: string[], allCurrentlySelected: boolean) => {
        if (role === "super_admin") return;
        setPermissions((prev) => {
            const next = { ...prev };
            groupKeys.forEach((key) => {
                next[key] = !allCurrentlySelected;
            });
            return next;
        });
    };

    const handleSelectAll = () => {
        if (role === "super_admin") return;
        const allTrue: Record<string, boolean> = {};
        ALL_PERMISSION_KEYS.forEach((key) => {
            allTrue[key] = true;
        });
        setPermissions(allTrue);
    };

    const handleDeselectAll = () => {
        if (role === "super_admin") return;
        const allFalse: Record<string, boolean> = {};
        ALL_PERMISSION_KEYS.forEach((key) => {
            allFalse[key] = false;
        });
        setPermissions(allFalse);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Full Name is required";
        if (!username.trim()) {
            newErrors.username = "Username is required";
        } else if (username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_@.-]+$/.test(username.trim())) {
            newErrors.username = "Letters, numbers, @, _, ., and - only";
        }

        if (!isEdit && (!password || password.length < 6)) {
            newErrors.password = "Password must be at least 6 characters";
        } else if (isEdit && password && password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            // Switch to account tab if validation error is on account fields
            setActiveTab("account");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("adminToken");
            const url = isEdit ? `/api/admins/${admin.id}` : "/api/admins";
            const method = isEdit ? "PUT" : "POST";

            const payload: any = {
                name: name.trim(),
                username: username.trim().toLowerCase(),
                role,
                permissions: role === "super_admin" ? {} : permissions,
            };

            if (isEdit) {
                payload.is_active = isActive;
                if (password && password.trim().length >= 6) {
                    payload.password = password.trim();
                }
            } else {
                payload.password = password.trim();
            }

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.message || "Failed to save admin account");
                setSubmitting(false);
                return;
            }

            toast.success(
                isEdit
                    ? "Admin account updated successfully"
                    : "Admin account created successfully"
            );

            if (!isEdit) {
                onSuccess({
                    name: name.trim(),
                    username: username.trim().toLowerCase(),
                    password: password.trim(),
                    role,
                });
            } else {
                onSuccess();
            }
        } catch (err: any) {
            console.error("Save admin error:", err);
            toast.error(err.message || "An error occurred while saving");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[92vh] max-h-[840px] min-h-[540px] overflow-hidden animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0 border-b border-primary-hover/30 shadow-xs">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            {isEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                            <span>{isEdit ? "Edit Administrator" : "Add New Administrator"}</span>
                        </h2>
                        <p className="text-white/80 text-xs mt-0.5">
                            {isEdit
                                ? "Update admin credentials, role, and granular permissions"
                                : "Create a new administrator with customized access control"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form wrapper */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {/* Mobile Tab Selector (Visible on < lg screens) */}
                    <div className="flex lg:hidden border-b border-gray-200 bg-gray-50/90 p-2 gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("account")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                                activeTab === "account"
                                    ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <User size={14} />
                            <span>Account & Role</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("permissions")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                                activeTab === "permissions"
                                    ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <Shield size={14} />
                            <span>Permissions</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                                {selectedCount}
                            </span>
                        </button>
                    </div>

                    {/* Main Two-Panel Body (Desktop: side-by-side, Mobile: tabbed) */}
                    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
                        {/* Left Panel: Account Info & Role Assignment */}
                        <div
                            className={`lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-5 sm:p-6 overflow-y-auto space-y-5 ${
                                activeTab === "account" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
                            }`}
                        >
                            {/* Account Information */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <User size={14} className="text-gray-600" />
                                    <span>Account Information</span>
                                </h3>
                                <div className="space-y-3.5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Muhammed"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                                errors.name ? "border-red-400 bg-red-50/30" : "border-gray-200"
                                            }`}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                            placeholder="e.g. muhammed.admin"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                                errors.username ? "border-red-400 bg-red-50/30" : "border-gray-200"
                                            }`}
                                        />
                                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-gray-700">
                                                {isEdit ? "Change Password" : "Password"} {!isEdit && <span className="text-red-500">*</span>}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateRandomPassword}
                                                className="text-[11px] text-primary font-semibold hover:underline inline-flex items-center gap-1"
                                            >
                                                <Sparkles size={12} />
                                                Generate
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={isEdit ? "Leave blank to keep existing" : "Min 6 characters"}
                                                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                                    errors.password ? "border-red-400 bg-red-50/30" : "border-gray-200"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Role Assignment */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Shield size={14} className="text-gray-600" />
                                    <span>Role Assignment</span>
                                </h3>
                                <div className="space-y-2.5">
                                    {/* Normal Admin */}
                                    <label
                                        className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            role === "admin"
                                                ? "border-primary bg-primary/5 shadow-xs"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === "admin"}
                                            onChange={() => setRole("admin")}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                role === "admin" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            <User size={15} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-xs text-gray-900">Standard Admin</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                                Restricted strictly to configured permissions.
                                            </div>
                                        </div>
                                    </label>

                                    {/* Super Admin */}
                                    <label
                                        className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            role === "super_admin"
                                                ? "border-purple-600 bg-purple-50/60 shadow-xs"
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value="super_admin"
                                            checked={role === "super_admin"}
                                            onChange={() => setRole("super_admin")}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                role === "super_admin"
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            <Shield size={15} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-xs text-gray-900">Super Administrator</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                                Unconditional full access to all features & APIs.
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Edit: Status Toggle */}
                            {isEdit && (
                                <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">Account Status</div>
                                        <div className="text-[11px] text-gray-500">
                                            {isActive ? "Account is currently active" : "Account is deactivated"}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                            isActive ? "bg-emerald-600" : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isActive ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Granular Feature Permissions */}
                        <div
                            className={`flex-1 min-h-0 flex flex-col p-5 sm:p-6 bg-white overflow-hidden ${
                                activeTab === "permissions" ? "flex" : "hidden lg:flex"
                            }`}
                        >
                            {/* Panel Header */}
                            <div className="shrink-0 pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            Granular Permissions
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                            {selectedCount} of {ALL_PERMISSION_KEYS.length} granted
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Select sections and actions this administrator is authorized to access
                                    </p>
                                </div>

                                {role !== "super_admin" && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            className="text-xs font-semibold text-primary hover:underline px-2.5 py-1 bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeselectAll}
                                            className="text-xs font-semibold text-gray-600 hover:underline px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200/70 transition-colors"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Super Admin Notice Banner inside Right Panel */}
                            {role === "super_admin" && (
                                <div className="p-3.5 my-3 bg-purple-50/80 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-start gap-2.5 shrink-0">
                                    <Shield className="text-purple-600 shrink-0 mt-0.5" size={17} />
                                    <div>
                                        <h4 className="font-bold text-xs text-purple-950">Super Administrator - Full Unrestricted Access</h4>
                                        <p className="text-purple-700 mt-0.5 text-[11px] leading-relaxed">
                                            Super admins automatically have full access to every section, operation, and setting. Granular permission overrides are not required for this role.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Scrollable Permissions List (INDEPENDENT SCROLL) */}
                            <div className={`flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-3.5 pt-3 ${role === "super_admin" ? "opacity-60 pointer-events-none" : ""}`}>
                                {PERMISSION_REGISTRY.map((group) => {
                                    const groupKeys = group.permissions.map((p) => p.key);
                                    const allSelected = groupKeys.every((key) =>
                                        role === "super_admin" ? true : !!permissions[key]
                                    );
                                    const someSelected = groupKeys.some((key) =>
                                        role === "super_admin" ? true : !!permissions[key]
                                    );
                                    const grantedCount = groupKeys.filter((key) =>
                                        role === "super_admin" ? true : !!permissions[key]
                                    ).length;

                                    return (
                                        <div
                                            key={group.id}
                                            className={`border rounded-xl overflow-hidden bg-white shadow-xs transition-colors ${
                                                allSelected
                                                    ? "border-primary/40 ring-1 ring-primary/10"
                                                    : someSelected
                                                    ? "border-gray-300"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            {/* Group Header */}
                                            <div className="bg-gray-50/90 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-xs text-gray-900">
                                                        {group.name}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        ({grantedCount}/{group.permissions.length} granted)
                                                    </span>
                                                </div>
                                                {role !== "super_admin" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleGroup(groupKeys, allSelected)}
                                                        className="text-[11px] font-semibold text-primary hover:underline"
                                                    >
                                                        {allSelected ? "Deselect Group" : "Select Group"}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Permissions Grid */}
                                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                {group.permissions.map((perm) => {
                                                    const checked =
                                                        role === "super_admin" ? true : !!permissions[perm.key];

                                                    return (
                                                        <label
                                                            key={perm.key}
                                                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                                                                checked
                                                                    ? "bg-primary/5 border-primary/40 shadow-xs"
                                                                    : "border-gray-200/80 hover:bg-gray-50/80"
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => handleTogglePermission(perm.key)}
                                                                disabled={role === "super_admin"}
                                                                className="sr-only"
                                                            />
                                                            <div
                                                                className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                                                    checked
                                                                        ? "bg-primary text-white"
                                                                        : "border border-gray-300 bg-white"
                                                                }`}
                                                            >
                                                                {checked && <Check size={12} strokeWidth={3} />}
                                                            </div>
                                                            <div className="text-xs min-w-0">
                                                                <div className="font-semibold text-gray-900 leading-snug">
                                                                    {perm.label}
                                                                </div>
                                                                <div className="text-gray-500 text-[11px] mt-0.5 leading-snug">
                                                                    {perm.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Bottom Action Buttons */}
                    <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 bg-gray-50/90 border-t border-gray-200 flex items-center justify-between gap-3 z-10 shadow-xs">
                        <div className="text-xs text-gray-500 font-medium hidden sm:flex items-center gap-2">
                            <span>Target Role:</span>
                            <span
                                className={`px-2 py-0.5 rounded-md font-semibold text-xs ${
                                    role === "super_admin"
                                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-primary/10 text-primary border border-primary/20"
                                }`}
                            >
                                {role === "super_admin" ? "Super Administrator" : "Standard Admin"}
                            </span>
                            {role !== "super_admin" && (
                                <span className="text-gray-400">· {selectedCount} permissions granted</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-300 bg-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : isEdit ? (
                                    "Save Changes"
                                ) : (
                                    "Create Admin"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
