"use client";
import React, { useState } from "react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface FormData {
    full_name: string;
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
    nationality: string;
    pincode: string;
    previous_school: string;
    previous_madrasa: string;
    previous_school_class: string;
    previous_madrasa_class: string;
    guardian_name: string;
    guardian_relation: string;
    guardian_contact: string;
    medical_conditions: string;
    register_number?: string;
}

interface EditApplicationFormProps {
    initialData: any;
}

export default function EditApplicationForm({ initialData }: EditApplicationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        full_name: initialData?.full_name || "",
        father_name: initialData?.father_name || "",
        mother_name: initialData?.mother_name || "",
        age: initialData?.age || "",
        date_of_birth: initialData?.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : "",
        gender: initialData?.gender || "",
        email: initialData?.email || "",
        contact_number: initialData?.contact_number || "",
        whatsapp_number: initialData?.whatsapp_number || "",
        house_name: initialData?.house_name || "",
        place: initialData?.place || "",
        district: initialData?.district || "",
        post_office: initialData?.post_office || "",
        state: initialData?.state || "",
        nationality: initialData?.nationality || "",
        pincode: initialData?.pincode || "",
        previous_school: initialData?.previous_school || "",
        previous_madrasa_class: initialData?.previous_madrasa_class || "",
        previous_school_class: initialData?.previous_school_class || "",
        previous_madrasa: initialData?.previous_madrasa || "",
        guardian_name: initialData?.guardian_name || "",
        guardian_relation: initialData?.guardian_relation || "",
        guardian_contact: initialData?.guardian_contact || "",
        medical_conditions: initialData?.medical_conditions || "",
        register_number: initialData?.register_number || "",
    });

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            if (name === "date_of_birth") {
                return { ...prev, date_of_birth: value, age: calculateAge(value).toString() };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await apiClient.put(`/update_application/${initialData.id}`, formData);
            if (response.data.success || response.status === 200) {
                toast.success("Application updated successfully!");
                router.push("/admission");
            }
        } catch (error) {
            toast.error("Failed to update application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-(--primary-color) mb-6 pb-3 border-b-2 border-(--accent-gold)/20">
                Edit Application Data
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>

                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-semibold text-(--primary-color) mb-2">Registration Number</label>
                        <input
                            type="text"
                            name="register_number"
                            value={formData.register_number}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-(--accent-gold) outline-none transition-all"
                            placeholder="e.g. iga/001/2026"
                        />
                        <p className="text-xs text-gray-500 mt-1">Update the registration number format here. Leave it if you do not want to change the existing one.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Father's Name *</label>
                            <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mother's Name *</label>
                            <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors">
                                <option value="">Select</option>
                                <option value="male">Male</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
                            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Contact Details</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
                            <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Number *</label>
                            <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">House Name *</label>
                            <input type="text" name="house_name" value={formData.house_name} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Place *</label>
                            <input type="text" name="place" value={formData.place} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Post Office *</label>
                            <input type="text" name="post_office" value={formData.post_office} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode *</label>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nationality *</label>
                            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Education Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Educational Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Previous School</label>
                            <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Previous School Class</label>
                            <input type="text" name="previous_school_class" value={formData.previous_school_class} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Previous Madrasa</label>
                            <input type="text" name="previous_madrasa" value={formData.previous_madrasa} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Previous Madrasa Class</label>
                            <input type="text" name="previous_madrasa_class" value={formData.previous_madrasa_class} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Guardian and Medical */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Other Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Guardian Name</label>
                            <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Guardian Relation</label>
                            <input type="text" name="guardian_relation" value={formData.guardian_relation} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Guardian Contact</label>
                            <input type="text" name="guardian_contact" value={formData.guardian_contact} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Medical Conditions</label>
                            <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} className="w-full px-4 py-2 rounded-[5px] border-2 border-gray-300 focus:border-(--accent-gold) outline-none transition-colors" rows={3}></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => router.push('/admission')} className="px-6 py-2 border rounded-[5px] text-gray-600 hover:bg-gray-50 font-medium">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-(--accent-gold) text-white rounded-[5px] hover:bg-(--accent-light) disabled:opacity-50 font-medium tracking-wide">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
