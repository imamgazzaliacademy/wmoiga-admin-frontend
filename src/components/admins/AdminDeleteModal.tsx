"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { AdminUser } from "@/utils/permissions";
import { useAuth } from "@/context/AuthContext";

interface AdminDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    admin: AdminUser | null;
}

export default function AdminDeleteModal({
    isOpen,
    onClose,
    onSuccess,
    admin,
}: AdminDeleteModalProps) {
    const { user: currentUser } = useAuth();
    const [deleting, setDeleting] = useState(false);

    if (!isOpen || !admin) return null;

    const isSelf = currentUser?.id === admin.id;

    const handleDelete = async () => {
        if (isSelf) {
            toast.error("You cannot delete your own admin account.");
            return;
        }

        setDeleting(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`/api/admins/${admin.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.message || "Failed to delete admin account");
                setDeleting(false);
                return;
            }

            toast.success("Administrator account deleted successfully");
            onSuccess();
        } catch (err: any) {
            console.error("Delete admin error:", err);
            toast.error(err.message || "An error occurred while deleting");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header with warning icon */}
                <div className="p-6 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={28} />
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">Delete Administrator</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Are you sure you want to permanently delete{" "}
                        <strong className="text-gray-900">{admin.name}</strong> (@{admin.username})?
                    </p>

                    {isSelf ? (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-left">
                            <strong>Action Not Allowed:</strong> You cannot delete your currently logged-in account.
                            Please ask another Super Administrator if you need this account removed.
                        </div>
                    ) : (
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-left">
                            This action will permanently revoke access and remove the administrator record from the system.
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200/70 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting || isSelf}
                        className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete Account
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
