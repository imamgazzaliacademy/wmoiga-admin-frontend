"use client";

import {
    Users,
    GraduationCap,
    FileText,
    TrendingUp,
    Bell,
    ArrowRight,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardStatsQuery } from "@/store/api/adminApi";

export default function DashboardPage() {
    const { data: stats, isLoading: loading, isFetching, refetch } = useGetDashboardStatsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const statCards = [
        {
            title: "Total Students",
            value: stats?.totalStudents !== undefined ? stats.totalStudents : 0,
            icon: Users,
            description: "Active students enrolled",
        },
        {
            title: "Total Alumni",
            value: stats?.totalAlumni !== undefined ? stats.totalAlumni : 0,
            icon: GraduationCap,
            description: "Registered alumni members",
        },
        {
            title: "Total Applications",
            value: stats?.totalApplications !== undefined ? stats.totalApplications : 0,
            icon: FileText,
            description: "Admissions processed",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-2">Welcome back, Administrator. Here's what's happening today.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors border border-neutral-300 shadow-2xs self-start sm:self-auto disabled:opacity-50"
                    title="Refresh Stats"
                >
                    <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
                    <span>Refresh</span>
                </button>
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
