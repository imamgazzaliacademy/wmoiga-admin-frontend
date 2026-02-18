"use client";

import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Application = {
    id: string;
    applicantName: string;
    course: string;
    appliedDate: string;
    status: "Review" | "Accepted" | "Rejected";
};

const mockApplications: Application[] = [
    { id: "APP001", applicantName: "Fatima R.", course: "Computer Science", appliedDate: "2023-10-15", status: "Review" },
    { id: "APP002", applicantName: "Rahul K.", course: "Economics", appliedDate: "2023-10-14", status: "Accepted" },
    { id: "APP003", applicantName: "Sneha M.", course: "English Literature", appliedDate: "2023-10-12", status: "Rejected" },
    { id: "APP004", applicantName: "Mohammed A.", course: "Mathematics", appliedDate: "2023-10-10", status: "Accepted" },
];

export default function AdmissionPage() {
    const [apps, setApps] = useState(mockApplications);

    const handleManualAdd = () => {
        // Logic to open modal or redirect would go here
        alert("Open Manual Application Form Modal");
    };

    const downloadHallTicket = (id: string) => {
        alert(`Downloading Hall Ticket for ${id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Admission Management</h1>
                    <p className="text-gray-500">Manage student applications and hall tickets.</p>
                </div>
                <Link
                    href="/admission/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Add Manual Application
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>App ID</TableHead>
                                <TableHead>Applicant Name</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apps.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.id}</TableCell>
                                    <TableCell>{app.applicantName}</TableCell>
                                    <TableCell>{app.course}</TableCell>
                                    <TableCell>{app.appliedDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            app.status === "Accepted" ? "success" :
                                                app.status === "Rejected" ? "destructive" : "default"
                                        }>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {app.status === "Accepted" && (
                                            <button
                                                onClick={() => downloadHallTicket(app.id)}
                                                className="flex items-center gap-1 text-sm text-primary hover:underline ml-auto"
                                            >
                                                <Download size={14} />
                                                Hall Ticket
                                            </button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
