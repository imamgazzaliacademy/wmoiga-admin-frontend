"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PermissionGuardProps {
    permission?: string;
    superAdminOnly?: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function PermissionGuard({
    permission,
    superAdminOnly = false,
    children,
    fallback,
}: PermissionGuardProps) {
    const { loading, isSuperAdmin, hasPermission } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isAllowed = superAdminOnly
        ? isSuperAdmin
        : isSuperAdmin || (permission ? hasPermission(permission) : true);

    if (isAllowed) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    You do not have permission to access this feature. Please contact your Super Administrator if you believe this is in error.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
