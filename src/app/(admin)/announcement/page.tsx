"use client";

import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Announcement = {
    id: string;
    title: string;
    date: string;
    content: string;
};

const mockAnnouncements: Announcement[] = [
    { id: "1", title: "Semester Exam Dates", date: "2023-11-01", content: "The semester exams will begin from 15th November..." },
    { id: "2", title: "Alumni Meet 2024", date: "2023-10-28", content: "We are excited to announce the annual Alumni Meet..." },
];

export default function AnnouncementPage() {
    const [announcements, setAnnouncements] = useState(mockAnnouncements);

    // Mock form state
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = (id: string) => {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
                    <p className="text-gray-500">Manage public announcements and news.</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    <Plus size={18} />
                    New Announcement
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* List */}
                <div className="space-y-4">
                    {announcements.map((item) => (
                        <Card key={item.id} className="group relative hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                                    <span className="text-xs text-gray-400">{item.date}</span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2">{item.content}</p>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button className="p-1.5 text-gray-500 hover:text-primary bg-white rounded-full shadow-sm">
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 bg-white rounded-full shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Editor (Mock) */}
                {isEditing && (
                    <Card className="h-fit animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>Create Announcement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input className="w-full p-2 border rounded-md" placeholder="Enter title" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <textarea className="w-full p-2 border rounded-md h-32" placeholder="Write announcement text..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded"
                                    onClick={() => {
                                        setAnnouncements(prev => [{
                                            id: Date.now().toString(),
                                            title: "New Announcement",
                                            date: new Date().toISOString().split('T')[0],
                                            content: "This is a new announcement added just now."
                                        }, ...prev]);
                                        setIsEditing(false);
                                    }}
                                >
                                    Post
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
