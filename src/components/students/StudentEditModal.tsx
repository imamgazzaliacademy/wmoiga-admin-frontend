"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, User, Calendar, BookOpen, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { adminApi } from "@/store/api/adminApi";
import { SUPPORTED_CLASSES } from "./StudentRegistrationModal";

interface Props {
  isOpen: boolean;
  student: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentEditModal({ isOpen, student, onClose, onSuccess }: Props) {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [className, setClassName] = useState("8");
  const [admissionYear, setAdmissionYear] = useState<number>(2026);
  const [fatherName, setFatherName] = useState("");
  const [place, setPlace] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    if (student) {
      setFullName(student.full_name || "");
      setDateOfBirth(student.date_of_birth || "");
      setClassName(student.class_name || "8");
      setAdmissionYear(student.admission_year || 2026);
      setFatherName(student.father_name || "");
      setPlace(student.place || "");
      setGuardianContact(student.guardian_contact || "");
      setAltPhone(student.alt_phone || "");
      setEmail(student.email || "");
      setStatus(student.status || "Active");
      setPhotoPreview(student.photo_url || "");
      setPhotoFile(null);
    }
  }, [student, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!dateOfBirth) {
      toast.error("Date of Birth is required");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Updating student record...");

    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("date_of_birth", dateOfBirth);
      formData.append("admission_year", String(admissionYear));
      formData.append("class_name", className.trim());
      formData.append("father_name", fatherName.trim());
      formData.append("place", place.trim());
      formData.append("guardian_contact", guardianContact.trim());
      formData.append("alt_phone", altPhone.trim());
      formData.append("email", email.trim());
      formData.append("status", status);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await apiClient.put(`/students/${student.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(adminApi.util.invalidateTags([{ type: 'Students', id: 'LIST' }]));

      toast.update(loadingToast, {
        render: res.data?.message || "Student details updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update student details";
      toast.update(loadingToast, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Black and White */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold truncate">Edit Student Details</h2>
            <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
              Admission Number: <span className="text-white font-mono font-bold bg-neutral-800 px-1.5 py-0.5 rounded">{student.admission_number}</span> (Immutable)
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Read-only Admission ID & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1">
                Admission Number
              </label>
              <input
                type="text"
                readOnly
                value={student.admission_number}
                className="w-full px-3 py-2 text-sm bg-neutral-100 border border-neutral-300 rounded-md text-neutral-900 font-mono font-bold cursor-not-allowed"
              />
              <p className="text-[11px] text-neutral-500 mt-1">Admission numbers are permanently locked</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b pb-1">
              Student Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                >
                  {SUPPORTED_CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Admission Year / Batch
                </label>
                <select
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium"
                >
                  {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                    <option key={yr} value={yr}>
                      Batch {yr}/{String(yr + 1).slice(-2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Place / City</label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Guardian Contact</label>
                <input
                  type="tel"
                  value={guardianContact}
                  onChange={(e) => setGuardianContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Alternative Phone</label>
                <input
                  type="tel"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>

              {/* Photo Update */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Update Photo</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-neutral-300 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Choose New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-300">
                      <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* Footer buttons - Solid Black and White */}
          <div className="shrink-0 flex items-center justify-end gap-2 sm:gap-3 p-3 sm:px-6 bg-neutral-50 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 sm:px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
