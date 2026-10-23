"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const { loading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-secondary flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-600">Verifying session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} />
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 pb-24 min-w-0">
                    <div className="lg:max-w-400 w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
