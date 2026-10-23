"use client";

import { useState, useRef } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Paperclip,
    FileText,
    Download,
    X,
    ExternalLink,
    UploadCloud,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFetch } from "@/hooks/useFetch";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useAuth } from "@/context/AuthContext";

export type AnnouncementCategory = "Public" | "Student Portal" | "Teachers";

export type Announcement = {
    id: number;
    title: string;
    createdAt?: string;
    content: string;
    category: AnnouncementCategory;
    attachment_url?: string | null;
    attachment_name?: string | null;
    download_link_text?: string | null;
};

const CATEGORIES: { label: string; value: AnnouncementCategory; badgeColor: string }[] = [
    { label: "Public", value: "Public", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Student Portal", value: "Student Portal", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Teachers", value: "Teachers", badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function AnnouncementPage() {
    const { hasPermission } = useAuth();
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
    const { data, loading, refetch } = useFetch<Announcement[]>("/get_announcement");

    // Editor state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        category: AnnouncementCategory;
        download_link_text: string;
    }>({
        title: "",
        content: "",
        category: "Public",
        download_link_text: "Download File",
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingAttachment, setExistingAttachment] = useState<{
        url: string | null;
        name: string | null;
    }>({ url: null, name: null });
    const [removeAttachment, setRemoveAttachment] = useState(false);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            category: "Public",
            download_link_text: "Download File",
        });
        setSelectedFile(null);
        setExistingAttachment({ url: null, name: null });
        setRemoveAttachment(false);
        setEditingId(null);
        setIsEditing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCreateNew = () => {
        resetForm();
        setIsEditing(true);
    };

    const handleEdit = (item: Announcement) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            content: item.content,
            category: item.category || "Public",
            download_link_text: item.download_link_text || "Download File",
        });
        setExistingAttachment({
            url: item.attachment_url || null,
            name: item.attachment_name || null,
        });
        setSelectedFile(null);
        setRemoveAttachment(false);
        setIsEditing(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error("File size exceeds the maximum allowed limit of 10 MB.");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setRemoveAttachment(false);
    };

    const handlePost = async () => {
        if (!formData.title.trim()) {
            toast.error("Title is required.");
            return;
        }
        if (!formData.content.trim()) {
            toast.error("Content is required.");
            return;
        }
        if (!formData.category) {
            toast.error("Category is required.");
            return;
        }

        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("title", formData.title.trim());
            payload.append("content", formData.content.trim());
            payload.append("category", formData.category);
            payload.append(
                "download_link_text",
                formData.download_link_text.trim() || "Download File"
            );

            if (selectedFile) {
                payload.append("attachment", selectedFile);
            }

            if (editingId) {
                if (removeAttachment) {
                    payload.append("remove_attachment", "true");
                }
                await apiClient.patch(`/update_announcement/${editingId}`, payload);
                toast.success("Announcement updated successfully!");
            } else {
                await apiClient.post("/create_announcement", payload);
                toast.success("Announcement created successfully!");
            }

            resetForm();
            refetch();
        } catch (error: any) {
            console.error("Failed to save announcement", error);
            const errorMsg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save announcement.";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await apiClient.delete(`/delete_announcement/${id}`);
            toast.success("Announcement deleted successfully!");
            if (editingId === id) {
                resetForm();
            }
            refetch();
        } catch (error: any) {
            console.error("Failed to delete announcement", error);
            const errorMsg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete announcement.";
            toast.error(errorMsg);
        }
    };

    const filteredData = (data || []).filter((item) => {
        if (selectedCategoryFilter === "All") return true;
        return (item.category || "Public") === selectedCategoryFilter;
    });

    const getCategoryBadgeClass = (category?: string) => {
        const found = CATEGORIES.find((c) => c.value === category);
        return found ? found.badgeColor : "bg-gray-100 text-gray-700 border-gray-200";
    };

    return (
        <PermissionGuard permission="view_announcements">
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
                    <p className="text-sm text-gray-500">
                        Create, publish, and target announcements for Public, Student Portal, or Teachers.
                    </p>
                </div>
                {hasPermission("add_update_announcements") && (
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm shrink-0"
                    >
                        <Plus size={18} />
                        New Announcement
                    </button>
                )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
                    Filter:
                </span>
                {["All", "Public", "Student Portal", "Teachers"].map((cat) => {
                    const count =
                        cat === "All"
                            ? (data || []).length
                            : (data || []).filter((d) => (d.category || "Public") === cat).length;
                    const isActive = selectedCategoryFilter === cat;

                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                                isActive
                                    ? "bg-primary text-white shadow-xs"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            <span>{cat}</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* List Column */}
                <div className={`${isEditing ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                    {loading ? (
                        [1, 2, 3].map((n) => (
                            <Card key={n} className="relative">
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
                    ) : filteredData.length > 0 ? (
                        filteredData.map((item) => (
                            <Card
                                key={item.id}
                                className={`group relative hover:shadow-md transition-all border ${
                                    editingId === item.id ? "ring-2 ring-primary border-primary" : ""
                                }`}
                            >
                                <CardContent className="p-5 sm:p-6 space-y-3">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="space-y-1.5 flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                                                        item.category
                                                    )}`}
                                                >
                                                    {item.category || "Public"}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {item.createdAt
                                                        ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                                              year: "numeric",
                                                              month: "short",
                                                              day: "numeric",
                                                          })
                                                        : ""}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground leading-snug">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {hasPermission("add_update_announcements") && (
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                                                    title="Edit Announcement"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {hasPermission("delete_announcements") && (
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm whitespace-pre-line">
                                        {item.content}
                                    </p>

                                    {/* Attachment details */}
                                    {item.attachment_url && (
                                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 truncate mr-2">
                                                <Paperclip size={14} className="text-primary shrink-0" />
                                                <span className="font-medium truncate">
                                                    {item.attachment_name || "Attachment"}
                                                </span>
                                            </div>
                                            <a
                                                href={item.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md transition-colors shrink-0"
                                            >
                                                <Download size={13} />
                                                <span>{item.download_link_text || "Download File"}</span>
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 border rounded-xl bg-gray-50/50 space-y-1">
                            <p className="font-medium text-gray-700">No announcements found.</p>
                            <p className="text-xs text-gray-400">
                                {selectedCategoryFilter !== "All"
                                    ? `There are no announcements in the "${selectedCategoryFilter}" category.`
                                    : "Click 'New Announcement' above to publish your first announcement."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Editor Column */}
                {isEditing && (
                    <div className="lg:col-span-5 sticky top-6">
                        <Card className="animate-in fade-in slide-in-from-right-4 duration-300 shadow-lg border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                                <CardTitle className="text-lg">
                                    {editingId ? "Edit Announcement" : "Create Announcement"}
                                </CardTitle>
                                <button
                                    onClick={resetForm}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                                >
                                    <X size={18} />
                                </button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Enter announcement title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, title: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* Category dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Target Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                category: e.target.value as AnnouncementCategory,
                                            }))
                                        }
                                    >
                                        <option value="Public">Public (Website & Visitors)</option>
                                        <option value="Student Portal">Student Portal (Enrolled Students)</option>
                                        <option value="Teachers">Teachers (Internal Faculty)</option>
                                    </select>
                                    <p className="text-[11px] text-gray-400">
                                        Controls which audience sees this announcement.
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Announcement Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg text-sm h-28 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                        placeholder="Write announcement details..."
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, content: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* Attachment Upload */}
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                                        <span>File Attachment (Optional)</span>
                                        <span className="text-[11px] font-normal text-gray-400">
                                            Max 10 MB
                                        </span>
                                    </label>

                                    {/* Existing attachment if editing */}
                                    {editingId && existingAttachment.url && !removeAttachment && !selectedFile && (
                                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2 truncate mr-2">
                                                <FileText size={16} className="text-primary shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-xs font-medium text-gray-800 truncate">
                                                        {existingAttachment.name || "Existing Attachment"}
                                                    </p>
                                                    <a
                                                        href={existingAttachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <span>Preview</span>
                                                        <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRemoveAttachment(true)}
                                                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    {/* Attachment removal notice */}
                                    {editingId && removeAttachment && !selectedFile && (
                                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                                            <span>Existing attachment will be removed upon saving.</span>
                                            <button
                                                type="button"
                                                onClick={() => setRemoveAttachment(false)}
                                                className="text-xs font-semibold text-amber-900 underline ml-2"
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    )}

                                    {/* File Picker input */}
                                    <div className="relative">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="announcement-attachment-input"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.txt"
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="announcement-attachment-input"
                                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 hover:border-primary rounded-xl cursor-pointer bg-gray-50/50 hover:bg-primary/5 transition-all text-center group"
                                        >
                                            <UploadCloud
                                                size={22}
                                                className="text-gray-400 group-hover:text-primary transition-colors mb-1"
                                            />
                                            <p className="text-xs font-medium text-gray-700">
                                                {selectedFile
                                                    ? selectedFile.name
                                                    : existingAttachment.url && !removeAttachment
                                                    ? "Click to replace current attachment"
                                                    : "Click to upload a file"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                PDF, DOC, DOCX, Images, Excel (up to 10 MB)
                                            </p>
                                        </label>

                                        {selectedFile && (
                                            <div className="mt-2 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">
                                                <span className="truncate mr-2 font-medium">
                                                    Selected: {selectedFile.name} (
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = "";
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Download Link Text Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Download Link Text
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="e.g. Download Brochure, Download Schedule"
                                        value={formData.download_link_text}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                download_link_text: e.target.value,
                                            }))
                                        }
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Text shown to users on the download link button (defaults to "Download File").
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-5 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5 font-medium shadow-xs"
                                        onClick={handlePost}
                                        disabled={saving}
                                    >
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        <span>{saving ? "Saving..." : editingId ? "Update" : "Publish"}</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
        </PermissionGuard>
    );
}
