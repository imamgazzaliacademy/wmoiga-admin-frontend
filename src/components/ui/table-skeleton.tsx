import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export function TableSkeletonRows({ columns, rows = 5 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="border-b border-neutral-100">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <TableCell key={colIndex} className="py-3 px-4">
                            <Skeleton className="h-4 w-full bg-neutral-200/80 rounded" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
    return (
        <div className="w-full border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <Table>
                <TableHeader className="bg-neutral-50">
                    <TableRow className="border-b border-neutral-200">
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i} className="py-3 px-4">
                                <Skeleton className="h-4 w-3/4 bg-neutral-200/80 rounded" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableSkeletonRows columns={columns} rows={rows} />
                </TableBody>
            </Table>
        </div>
    );
}
