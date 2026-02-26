"use client";

import { useEffect, useState } from "react";
import {
    Users,
    GraduationCap,
    FileText,
    TrendingUp,
    Bell,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/services/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
    totalStudents: string;
    totalAlumni: number;
    totalApplications: number;
    totalAnnouncements: number;
    recentApplications: any[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/get_dashboard_stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Total Students",
            value: stats?.totalStudents || "0",
            icon: Users,
            description: "Active students enrolled",
        },
        {
            title: "Total Alumni",
            value: stats?.totalAlumni || 0,
            icon: GraduationCap,
            description: "Registered alumni members",
        },
        {
            title: "Total Applications",
            value: stats?.totalApplications || 0,
            icon: FileText,
            description: "Admissions processed",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className="hover:shadow-lg transition-shadow border-primary/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Icon size={18} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Applications</CardTitle>
                        <Link href="/admission" className="text-sm text-primary flex items-center gap-1 hover:underline">
                            View All <ArrowRight size={14} />
                        </Link>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(n => <Skeleton key={n} className="h-12 w-full" />)}
                            </div>
                        ) : stats?.recentApplications?.length ? (
                            <div className="space-y-4">
                                {stats.recentApplications.map((app: any) => (
                                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{app.full_name}</p>
                                            <p className="text-xs text-gray-500">Reg: {app.register_number}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                                No recent applications found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>System Activity</CardTitle>
                        <TrendingUp className="text-gray-400 w-5 h-5" />
                    </CardHeader>
                    <CardContent className="flex-1">
                        {loading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Active Announcements</p>
                                        <p className="text-xs text-gray-500">There are {stats?.totalAnnouncements || 0} active announcements running on the frontend marquee.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
