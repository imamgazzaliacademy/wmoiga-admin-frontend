"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.replace('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return <div className="min-h-screen bg-secondary flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} />
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20">
                    <div className="lg:max-w-400 w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
