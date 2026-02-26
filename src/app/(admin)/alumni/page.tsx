"use client";

import { useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useFetch } from "@/hooks/useFetch";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function AlumniPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    // Fetch alumni
    const { data: alumni, metadata, loading } = useFetch<any[]>('/get_all_alumni', {
        params: { page, limit: 10, search }
    });

    const handleManualAdd = () => {
        alert("Add Alumni Modal");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Alumni Management</h1>
                    <p className="text-gray-500">Manage alumni directory and featured profiles.</p>
                </div>
                <button
                    onClick={handleManualAdd}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Add Alumni
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        placeholder="Search alumni..."
                        className="pl-8 pr-4 py-2 w-full border rounded-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <TableSkeleton columns={5} rows={5} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Profession</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Featured</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alumni && alumni.length > 0 ? (
                                    alumni.map((alumnus: any) => (
                                        <TableRow key={alumnus.id}>
                                            <TableCell className="font-medium">{alumnus.name}</TableCell>
                                            <TableCell>{alumnus.batch}</TableCell>
                                            <TableCell>{alumnus.profession || alumnus.currentPosition}</TableCell>
                                            <TableCell>{alumnus.organization}</TableCell>
                                            <TableCell>
                                                <Badge variant={alumnus.isFeatured ? "success" : "default"}>
                                                    {alumnus.isFeatured ? "Yes" : "No"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">No alumni found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {metadata && metadata.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-600">
                        Showing page {metadata.page} of {metadata.totalPages} ({metadata.total} total)
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 bg-white"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(metadata.totalPages, p + 1))}
                            disabled={page === metadata.totalPages}
                            className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 bg-white"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
