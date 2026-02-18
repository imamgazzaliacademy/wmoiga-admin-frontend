"use client";

import React, { useEffect, useRef, useState } from "react";
import { Upload, Check, X, Calendar, User, Mail, MapPin, Phone, GraduationCap, AlertCircle, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FormData {
    // Personal Information
    fullName: string;
    fatherName: string;
    motherName: string;
    age: string;
    dateOfBirth: string;
    gender: string;

    // Contact Information
    email: string;
    contactNumber: string;
    place: string;
    address: string;
    pincode: string;

    // Academic Information
    previousSchool: string;
    previousMadrasa: string;

    // Guardian Information
    guardianName: string;
    guardianRelation: string;
    guardianContact: string;

    // Additional
    medicalConditions: string;
}

export default function ManualApplicationForm() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });

    // File uploads
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [tcFile, setTcFile] = useState<File | null>(null);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        fatherName: "",
        motherName: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        contactNumber: "",
        place: "",
        address: "",
        pincode: "",
        previousSchool: "",
        previousMadrasa: "",
        guardianName: "",
        guardianRelation: "",
        guardianContact: "",
        medicalConditions: "",
    });

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Photo size should be less than 2MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "aadhaar" | "tc" | "certificate",
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size should be less than 5MB");
                return;
            }
            if (type === "aadhaar") setAadhaarFile(file);
            if (type === "tc") setTcFile(file);
            if (type === "certificate") setCertificateFile(file);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: "" });

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setSubmitStatus({
                type: "success",
                message:
                    "Application submitted successfully! Application ID: #MAN2023056",
            });
            // Reset form
            setFormData({
                fullName: "",
                fatherName: "",
                motherName: "",
                age: "",
                dateOfBirth: "",
                gender: "",
                email: "",
                contactNumber: "",
                place: "",
                address: "",
                pincode: "",
                previousSchool: "",
                previousMadrasa: "",
                guardianName: "",
                guardianRelation: "",
                guardianContact: "",
                medicalConditions: "",
            });
            setPhotoFile(null);
            setPhotoPreview("");
            setAadhaarFile(null);
            setTcFile(null);
            setCertificateFile(null);
            setCurrentStep(1);
        } catch (error) {
            setSubmitStatus({
                type: "error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        "Personal Details",
        "Contact Info",
        "Academic Info",
        "Documents",
    ];

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Form Header */}
            <div className="bg-primary p-8 text-center text-white">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Manual Application Entry</h2>
                <p className="opacity-80 mt-2 text-sm">Fill in the details for offline/manual admission registrations.</p>
            </div>

            {/* Progress Stepper */}
            <div className="px-8 pt-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -z-10" />
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                            ${currentStep > index + 1 ? "bg-green-500 border-green-500 text-white" :
                                        currentStep === index + 1 ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" :
                                            "bg-white border-gray-200 text-gray-400"}
                         `}
                            >
                                {currentStep > index + 1 ? <Check size={18} /> : index + 1}
                            </div>
                            <span className={`text-xs font-semibold uppercase ${currentStep === index + 1 ? "text-primary" : "text-gray-400"}`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 lg:p-12">
                <form onSubmit={handleSubmit}>

                    {/* Step 1: Personal Details */}
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Photo Upload Section */}
                                <div className="w-full md:w-auto flex flex-col items-center gap-4">
                                    <div className="relative w-40 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center group hover:border-primary transition-colors">
                                        {photoPreview ? (
                                            <>
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setPhotoFile(null); setPhotoPreview(""); }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                <span className="text-xs text-gray-500">Upload Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors shadow-sm">
                                        Choose Image
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    </label>
                                </div>

                                {/* Fields */}
                                <div className="flex-1 w-full grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                                        <input
                                            name="fullName" value={formData.fullName} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Enter Student Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Father's Name *</label>
                                        <input
                                            name="fatherName" value={formData.fatherName} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mother's Name *</label>
                                        <input
                                            name="motherName" value={formData.motherName} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth *</label>
                                        <input
                                            type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age *</label>
                                            <input
                                                type="number" name="age" value={formData.age} onChange={handleChange} required
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender *</label>
                                            <select
                                                name="gender" value={formData.gender} onChange={handleChange} required
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            >
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Info */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email" name="email" value={formData.email} onChange={handleChange} required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address *</label>
                                    <textarea
                                        name="address" value={formData.address} onChange={handleChange} required rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City/Place *</label>
                                    <input
                                        name="place" value={formData.place} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode *</label>
                                    <input
                                        name="pincode" value={formData.pincode} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                                    <User size={20} /> Guardian Information
                                </h4>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                                        <input
                                            name="guardianName" value={formData.guardianName} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Relation *</label>
                                        <select
                                            name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        >
                                            <option value="">Select</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact *</label>
                                        <input
                                            name="guardianContact" value={formData.guardianContact} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Academic Info */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Previous School *</label>
                                    <input
                                        name="previousSchool" value={formData.previousSchool} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Previous Madrasa *</label>
                                    <input
                                        name="previousMadrasa" value={formData.previousMadrasa} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medical Conditions</label>
                                    <textarea
                                        name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        placeholder="Any allergies or conditions..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Documents */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {[
                                { label: "Aadhaar Card", type: "aadhaar", file: aadhaarFile },
                                { label: "Transfer Certificate", type: "tc", file: tcFile },
                                { label: "Madrasa Certificate", type: "certificate", file: certificateFile },
                            ].map((doc) => (
                                <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{doc.label}</p>
                                            <p className="text-xs text-gray-500">Max 5MB. PDF/JPG/PNG</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {doc.file && (
                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <Check size={14} /> Uploaded
                                            </span>
                                        )}
                                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-primary text-gray-700 px-3 py-1.5 rounded-md text-sm transition-all shadow-sm">
                                            {doc.file ? "Change" : "Upload"}
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileUpload(e, doc.type as any)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}

                            {submitStatus.type && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${submitStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {submitStatus.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
                                    <span className="font-medium">{submitStatus.message}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${currentStep === 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-foreground"
                                }`}
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>

                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all transform active:scale-95"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                                {!isSubmitting && <Check size={18} />}
                            </button>
                        )}
                    </div>

                </form>
            </div>
        </div>
    );
}
