"use client";

import { useState } from "react";
import { Plus, Edit, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetch } from "@/hooks/useFetch";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ImportantDate = {
    id?: number;
    event_name: string;
    event_date: string;
    status: 'upcoming' | 'active' | 'completed';
};

export default function ImportantDatesPage() {
    const { data, loading, refetch } = useFetch<ImportantDate[]>('/get_important_dates');

    // Editor state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ImportantDate>({ event_name: '', event_date: '', status: 'upcoming' });
    const [saving, setSaving] = useState(false);

    const handleEdit = (item: ImportantDate) => {
        setFormData({ id: item.id, event_name: item.event_name, event_date: item.event_date, status: item.status });
        setIsEditing(true);
    };

    const handlePost = async () => {
        if (!formData.event_name || !formData.event_date) {
            toast.error("Please fill in required fields.");
            return;
        }
        setSaving(true);
        try {
            await apiClient.post('/create_or_update_important_dates', [formData]);
            toast.success(formData.id ? "Date updated successfully!" : "Date added successfully!");
            setIsEditing(false);
            setFormData({ event_name: '', event_date: '', status: 'upcoming' });
            refetch();
        } catch (error) {
            console.error("Failed to save date", error);
            toast.error("Failed to save date.");
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-300";
            case "active":
                return "bg-amber-100 text-amber-800 border-amber-300";
            case "upcoming":
                return "bg-blue-100 text-blue-800 border-blue-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Important Dates</h1>
                    <p className="text-gray-500">Manage admission timelines and important events.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ event_name: '', event_date: '', status: 'upcoming' });
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    <Plus size={18} />
                    Add Date
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Editor Modal/Card */}
                {isEditing && (
                    <div className="md:col-span-2 lg:col-span-1 order-first lg:order-last">
                        <Card className="h-fit animate-in fade-in slide-in-from-right-4 duration-300 border-primary shadow-sm">
                            <CardHeader>
                                <CardTitle>{formData.id ? "Edit Date" : "Add New Date"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Event Name</label>
                                    <input
                                        className="w-full p-2 border rounded-md"
                                        placeholder="e.g. Application Deadline"
                                        value={formData.event_name}
                                        onChange={(e) => setFormData(p => ({ ...p, event_name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Event Date</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        placeholder="e.g. 15th August 2024"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData(p => ({ ...p, event_date: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        className="w-full p-2 border rounded-md bg-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                        }}
                                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePost}
                                        disabled={saving || !formData.event_name || !formData.event_date}
                                        className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Date"}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* List */}
                <div className={`space-y-4 ${isEditing ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-2 lg:col-span-3'}`}>
                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((n) => (
                                <Card key={n} className="group relative">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="h-6 w-2/3" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : data && data.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.map((item) => (
                                <Card key={item.id} className="group relative hover:shadow-md transition-all border-l-4 border-l-primary cursor-default">
                                    <CardContent className="p-5 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className="font-bold text-foreground leading-tight">{item.event_name}</h3>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 flex items-center gap-2 rounded-md w-fit mt-3">
                                                <CalendarDays className="w-4 h-4" />
                                                {item.event_date}
                                            </div>
                                        </div>

                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1.5 text-gray-500 hover:text-primary bg-white rounded-md shadow-sm border mt-[32px]"
                                                title="Edit Date"
                                            >
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500 border rounded-lg bg-white shadow-sm flex flex-col items-center gap-3">
                            <CalendarDays className="w-12 h-12 text-gray-300" />
                            <p>No important dates found. Add one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
