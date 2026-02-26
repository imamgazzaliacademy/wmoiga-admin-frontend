"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetch } from "@/hooks/useFetch";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

type Announcement = {
    id: number;
    title: string;
    createdAt?: string;
    content: string;
};

export default function AnnouncementPage() {
    const { data, loading, refetch } = useFetch<Announcement[]>('/get_announcement');

    // Editor state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [saving, setSaving] = useState(false);

    const handleEdit = (item: Announcement) => {
        setEditingId(item.id);
        setFormData({ title: item.title, content: item.content });
        setIsEditing(true);
    };

    const handlePost = async () => {
        if (!formData.title || !formData.content) return;
        setSaving(true);
        try {
            if (editingId) {
                await apiClient.patch(`/update_announcement/${editingId}`, formData);
                toast.success("Announcement updated successfully!");
            } else {
                await apiClient.post('/create_announcement', formData);
                toast.success("Announcement created successfully!");
            }
            setIsEditing(false);
            setEditingId(null);
            setFormData({ title: '', content: '' });
            refetch();
        } catch (error) {
            console.error("Failed to save announcement", error);
            toast.error("Failed to save announcement.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await apiClient.delete(`/delete_announcement/${id}`);
            toast.success("Announcement deleted successfully!");
            refetch();
        } catch (error) {
            console.error("Failed to delete announcement", error);
            toast.error("Failed to delete announcement.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
                    <p className="text-gray-500">Manage public announcements and news.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', content: '' });
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    <Plus size={18} />
                    New Announcement
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map((n) => (
                            <Card key={n} className="group relative">
                                <CardContent className="p-6 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </CardContent>
                            </Card>
                        ))
                    ) : data && data.length > 0 ? (
                        data.map((item) => (
                            <Card key={item.id} className="group relative hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                                        <span className="text-xs text-gray-400">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2">{item.content}</p>

                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-gray-500 hover:text-primary bg-white rounded-full shadow-sm"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 bg-white rounded-full shadow-sm"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 border rounded-lg bg-gray-50">No announcements found.</div>
                    )}
                </div>

                {/* Editor (Mock) */}
                {isEditing && (
                    <Card className="h-fit animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Announcement" : "Create Announcement"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Enter title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <textarea
                                    className="w-full p-2 border rounded-md h-32"
                                    placeholder="Write announcement text..."
                                    value={formData.content}
                                    onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingId(null);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                                    onClick={handlePost}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
