"use client";

import { useState } from "react";
import { Download, Plus, Search, ChevronLeft, ChevronRight, Eye, X, FileText, Calendar, User, Phone, MapPin, Trash2 } from "lucide-react";
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
import { useFetch } from "@/hooks/useFetch";
import { toast } from "react-toastify";
import apiClient from "@/services/api";
import { TableSkeleton } from "@/components/ui/table-skeleton";

interface IApplication {
    id: number;
    register_number: string;
    full_name: string;
    photo_url: string;
    father_name: string;
    mother_name: string;
    age: string;
    date_of_birth: string;
    gender: string;
    email: string;
    contact_number: string;
    whatsapp_number: string;
    house_name: string;
    place: string;
    post_office: string;
    district: string;
    state: string;
    nationality?: string;
    pincode: string;
    previous_school: string;
    previous_madrasa: string;
    previous_school_class: string;
    previous_madrasa_class: string;
    guardian_name?: string;
    guardian_relation?: string;
    guardian_contact?: string;
    medical_conditions?: string;
    aadhaar_copy_url?: string;
    birth_certificate_url: string;
    madrasa_certificate_url?: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function AdmissionPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedApp, setSelectedApp] = useState<IApplication | null>(null);
    const [deleteModalAppId, setDeleteModalAppId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch applications
    const { data: apps, metadata, loading, refetch } = useFetch<any[]>('/get_all_application', {
        params: { page, limit: 10, search, status: statusFilter }
    });

    const handleManualAdd = () => {
        // Logic to open modal or redirect would go here
        toast.success("Open Manual Application Form Modal");
    };

    const downloadHallTicket = async (id: string, fileName: string) => {
        const loadingToast = toast.loading("Generating Hall Ticket...");
        try {
            const response = await apiClient.get<Blob>(`/download_hall_ticket/${id}`, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName}.pdf`);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.update(loadingToast, { render: "Hall Ticket Downloaded!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Failed to download PDF", error);
            toast.update(loadingToast, { render: "Failed to download Hall Ticket. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const downloadApplication = async (regNo: string, fileName: string) => {
        const loadingToast = toast.loading("Generating Application PDF...");
        try {
            const response = await apiClient.get<Blob>(`/download_application_pdf?regNo=${regNo}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.update(loadingToast, { render: "Application PDF Downloaded!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Failed to download Application PDF", error);
            toast.update(loadingToast, { render: "Failed to download Application PDF.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const deleteApp = async (id: number) => {
        setDeleteModalAppId(id);
    };

    const confirmDeleteApp = async () => {
        if (!deleteModalAppId) return;
        setIsDeleting(true);
        try {
            const response = await apiClient.delete(`/delete_application/${deleteModalAppId}`);
            if (response.data.success) {
                toast.success("Application deleted successfully");
                setDeleteModalAppId(null);
                if (refetch) refetch();
            } else {
                toast.error(response.data.message || "Failed to delete application");
            }
        } catch (error: any) {
            console.error("Failed to delete application", error);
            toast.error(error.response?.data?.message || "Failed to delete application");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
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

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        placeholder="Search applications..."
                        className="pl-8 pr-4 py-2 w-full border rounded-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <TableSkeleton columns={6} rows={5} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Register No</TableHead>
                                    <TableHead>Applicant Name</TableHead>
                                    <TableHead>Father Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apps && apps.length > 0 ? (
                                    apps.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">{app.register_number}</TableCell>
                                            <TableCell>{app.full_name}</TableCell>
                                            <TableCell>{app.father_name}</TableCell>
                                            <TableCell>{app.contact_number || app.course}</TableCell>
                                            <TableCell>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : app.appliedDate}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setSelectedApp(app)}
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => downloadApplication(app.register_number, `Application_${app.full_name}-${app.register_number}`)}
                                                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition-colors"
                                                        title="Download Application Form"
                                                    >
                                                        <FileText size={16} />
                                                        App Form
                                                    </button>
                                                    <button
                                                        onClick={() => downloadHallTicket(app.id.toString(), `${app.full_name}-HallTicket`)}
                                                        className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors"
                                                        title="Download Hall Ticket"
                                                    >
                                                        <Download size={16} />
                                                        Hall Ticket
                                                    </button>
                                                    <button
                                                        onClick={() => deleteApp(app.id)}
                                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors ml-2"
                                                        title="Delete Application"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">No applications found</TableCell>
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

            {/* Applicant Details Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="text-primary" /> Application Details
                            </h2>
                            <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Photo & Basic Info */}
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center text-center">
                                        <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                                            {selectedApp.photo_url ? (
                                                <img src={selectedApp.photo_url} alt="Applicant Photo" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-gray-300" />
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{selectedApp.full_name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">#{selectedApp.register_number}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                                        <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Parents</h4>
                                        <div><span className="text-xs text-gray-400">Father:</span> <p className="font-medium text-sm">{selectedApp.father_name}</p></div>
                                        <div><span className="text-xs text-gray-400">Mother:</span> <p className="font-medium text-sm">{selectedApp.mother_name}</p></div>
                                    </div>
                                </div>

                                {/* Details Columns */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
                                            <h4 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2"><Calendar size={14} /> Personal</h4>
                                            <p className="text-sm"><span className="text-gray-500">DOB:</span> <span className="font-medium">{selectedApp.date_of_birth}</span></p>
                                            <p className="text-sm"><span className="text-gray-500">Age:</span> <span className="font-medium">{selectedApp.age}</span></p>
                                            <p className="text-sm"><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{selectedApp.gender}</span></p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
                                            <h4 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2"><Phone size={14} /> Contact</h4>
                                            <p className="text-sm"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedApp.contact_number}</span></p>
                                            <p className="text-sm"><span className="text-gray-500">WhatsApp:</span> <span className="font-medium">{selectedApp.whatsapp_number}</span></p>
                                            <p className="text-sm"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedApp.email || 'N/A'}</span></p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2 mb-3"><MapPin size={14} /> Address</h4>
                                        <p className="text-sm font-medium">{selectedApp.house_name}, {selectedApp.place}</p>
                                        <p className="text-sm text-gray-600">PO: {selectedApp.post_office}, {selectedApp.district}</p>
                                        <p className="text-sm text-gray-600">{selectedApp.state}, {selectedApp.nationality} - {selectedApp.pincode}</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2 mb-3"><FileText size={14} /> Academic & Guardian</h4>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">Previous School/Class</p>
                                                <p className="text-sm font-medium">{selectedApp.previous_school || 'N/A'} / {selectedApp.previous_school_class || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Previous Madrasa/Class</p>
                                                <p className="text-sm font-medium">{selectedApp.previous_madrasa || 'N/A'} / {selectedApp.previous_madrasa_class || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Guardian Name & Contact</p>
                                                <p className="text-sm font-medium">{selectedApp.guardian_name || 'N/A'} ({selectedApp.guardian_contact || 'N/A'})</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Medical Conditions</p>
                                                <p className="text-sm font-medium text-red-600">{selectedApp.medical_conditions || 'None reported'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2 mb-3">Attached Documents</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedApp.aadhaar_copy_url && (
                                                <a href={selectedApp.aadhaar_copy_url.replace("pdf", "jpg")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors border border-blue-100">
                                                    <FileText size={16} /> Aadhaar
                                                </a>
                                            )}
                                            {selectedApp.birth_certificate_url && (
                                                <a href={selectedApp.birth_certificate_url.replace("pdf", "jpg")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors border border-green-100">
                                                    <FileText size={16} /> Birth Cert
                                                </a>
                                            )}
                                            {selectedApp.madrasa_certificate_url && (
                                                <a href={selectedApp.madrasa_certificate_url.replace("pdf", "jpg")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-100 transition-colors border border-purple-100">
                                                    <FileText size={16} /> Madrasa Cert
                                                </a>
                                            )}
                                            {!selectedApp.aadhaar_copy_url && !selectedApp.birth_certificate_url && !selectedApp.madrasa_certificate_url && (
                                                <span className="text-sm text-gray-400 italic">No extra documents attached.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalAppId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <Trash2 size={24} className="text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete Application</h2>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this application? This action cannot be undone. All associated data will be permanently removed.
                            </p>
                        </div>
                        <div className="bg-gray-50 flex items-center justify-end gap-3 px-6 py-4 border-t">
                            <button
                                onClick={() => setDeleteModalAppId(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteApp}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
