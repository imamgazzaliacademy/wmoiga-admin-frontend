"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import EditApplicationForm from '@/components/admission/EditApplicationForm';
import { useFetch } from '@/hooks/useFetch';
import { ApiResponse } from '@/types/api';

export default function EditApplicationPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: response, loading, error } = useFetch<ApiResponse<any>>(`/get_application/${id}`);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-(--primary-color)"></div>
            </div>
        );
    }

    if (error || !response) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-red-500 bg-red-50 px-6 py-4 rounded-lg shadow-sm border border-red-100">
                    {error || "Failed to load application data"}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <EditApplicationForm initialData={response} />
        </div>
    );
}
