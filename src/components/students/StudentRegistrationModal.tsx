"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, User, Calendar, BookOpen, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SUPPORTED_CLASSES = [
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "+1", label: "+1 (Plus One)" },
  { value: "+2", label: "+2 (Plus Two)" },
  { value: "D1", label: "D1 (Degree 1st Yr)" },
  { value: "D2", label: "D2 (Degree 2nd Yr)" },
  { value: "D3", label: "D3 (Degree 3rd Yr)" },
];

export default function StudentRegistrationModal({ isOpen, onClose, onSuccess }: Props) {
  const currentYear = new Date().getFullYear();
  const [admissionYear, setAdmissionYear] = useState<number>(currentYear);
  const [previewNumber, setPreviewNumber] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [className, setClassName] = useState("8");
  const [fatherName, setFatherName] = useState("");
  const [place, setPlace] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Fetch admission number preview whenever admissionYear changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const res = await apiClient.get("/students/preview_admission_number", {
          params: { year: admissionYear },
        });
        if (res.data?.data?.preview) {
          setPreviewNumber(res.data.data.preview);
        }
      } catch (err: any) {
        console.error("Failed to fetch preview admission number", err);
        setPreviewNumber(`IGA...${admissionYear}`);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [admissionYear, isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFullName("");
    setDateOfBirth("");
    setClassName("8");
    setFatherName("");
    setPlace("");
    setGuardianContact("");
    setAltPhone("");
    setEmail("");
    setPhotoFile(null);
    setPhotoPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!dateOfBirth) {
      toast.error("Date of Birth is required for student authentication");
      return;
    }
    if (!className) {
      toast.error("Class selection is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("date_of_birth", dateOfBirth);
      formData.append("admission_year", String(admissionYear));
      formData.append("class_name", className);

      if (fatherName.trim()) formData.append("father_name", fatherName.trim());
      if (place.trim()) formData.append("place", place.trim());
      if (guardianContact.trim()) formData.append("guardian_contact", guardianContact.trim());
      if (altPhone.trim()) formData.append("alt_phone", altPhone.trim());
      if (email.trim()) formData.append("email", email.trim());
      if (photoFile) formData.append("photo", photoFile);

      const res = await apiClient.post("/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `Student registered! Assigned Admission Number: ${res.data?.data?.admission_number}`
      );
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register student");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
        {/* Header - Clean Black and White */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold tracking-tight">Register New Student</h2>
            <p className="text-xs text-neutral-400">
              Admission number will be safely allocated via database sequence.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section 1: Admission Year & Generated Sequence Preview */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Admission Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-900"
                >
                  {[2022, 2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr}>
                      Academic Year {yr}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Determines the yearly sequence counter.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Preview Admission No
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={loadingPreview ? "Generating preview..." : previewNumber}
                    className="w-full px-3 py-2 text-sm font-mono font-bold bg-neutral-100 border border-neutral-300 rounded-md text-neutral-900 cursor-not-allowed"
                  />
                  {!loadingPreview && (
                    <span className="absolute right-2.5 top-2.5 text-neutral-400 text-xs">
                      (read-only)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Number is reserved safely only upon submission.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Core Required Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b pb-1">
              Required Student Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter student full name"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">Used as student login credential</p>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                  >
                    {SUPPORTED_CLASSES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Student Photo <span className="text-neutral-400">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-neutral-300 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors shrink-0">
                    <Upload size={14} />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoPreview ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-300 shrink-0">
                      <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400 truncate">No file chosen</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Optional Guardian & Contact Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b pb-1">
              Contact & Guardian Details (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father / Guardian Name"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Place / City</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Panamaram, Wayanad"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Guardian Contact</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="tel"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="Primary phone number"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Alternative Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="Secondary contact"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Clean Solid Black and White */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-md transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Student...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Register Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
