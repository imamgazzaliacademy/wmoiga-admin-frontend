"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";

interface AdminCreatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    credentials: {
        name: string;
        username: string;
        password: string;
        role: string;
    } | null;
}

export default function AdminCreatedModal({
    isOpen,
    onClose,
    credentials,
}: AdminCreatedModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !credentials) return null;

    const copyText = `Username: ${credentials.username}\nPassword: ${credentials.password}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copyText);
            setCopied(true);
            toast.success("Admin credentials copied to clipboard!");
            setTimeout(() => setCopied(false), 3000);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
                        <ShieldCheck size={30} />
                    </div>
                    <h2 className="text-xl font-bold">Admin Account Created</h2>
                    <p className="text-white/80 text-xs mt-1">
                        Please securely copy these credentials now.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Security Notice */}
                    <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed">
                        <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <span className="font-bold">One-Time Password Display:</span> Due to security hashing,
                            this password cannot be viewed again once you close this dialog.
                        </div>
                    </div>

                    {/* Credential Box */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 font-mono text-sm">
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                            <span className="text-gray-500 font-sans text-xs uppercase tracking-wider font-semibold">
                                Administrator:
                            </span>
                            <span className="font-semibold text-gray-900 font-sans">
                                {credentials.name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                            <span className="text-gray-500 font-sans text-xs uppercase tracking-wider font-semibold">
                                Username:
                            </span>
                            <span className="font-bold text-gray-900 select-all">
                                {credentials.username}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-500 font-sans text-xs uppercase tracking-wider font-semibold">
                                Temporary Password:
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 select-all">
                                {credentials.password}
                            </span>
                        </div>
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        type="button"
                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-md ${
                            copied
                                ? "bg-emerald-600 text-white"
                                : "bg-primary text-white hover:bg-primary/95"
                        }`}
                    >
                        {copied ? (
                            <>
                                <Check size={18} />
                                Copied to Clipboard!
                            </>
                        ) : (
                            <>
                                <Copy size={18} />
                                Copy Credentials
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full py-2.5 text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        I have copied the credentials, close dialog
                    </button>
                </div>
            </div>
        </div>
    );
}
