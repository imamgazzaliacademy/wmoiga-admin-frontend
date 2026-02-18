import {
    Users,
    GraduationCap,
    FileText,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Students",
            value: "1,248",
            icon: Users,
            description: "Active students enrolled",
        },
        {
            title: "Total Alumni",
            value: "842",
            icon: GraduationCap,
            description: "Registered alumni members",
        },
        {
            title: "Applications",
            value: "156",
            icon: FileText,
            description: "Pending verification",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, i) => {
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
                                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-100">
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-75 text-gray-400">
                        Chart or Recent List Placeholder
                    </CardContent>
                </Card>
                <Card className="h-100">
                    <CardHeader>
                        <CardTitle>Announcement Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-75 text-gray-400">
                        Chart or Activity Log Placeholder
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
