"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen}/>
            <div className="flex-1 flex overflow-hidden">
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
