"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  User,
  Phone,
  Mail,
  Briefcase,
  Building,
  Calendar,
  IndianRupee,
  Plus,
  Loader2,
  Trash2,
  Check,
} from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";

export const DEPARTMENT_OPTIONS = [
  "Teaching / Academic",
  "Administration / Office",
  "Kitchen / Cleaning Services",
  "Support & Maintenance",
  "Management",
  "Other",
] as const;

export const COMMON_DESIGNATIONS = [
  "Teacher",
  "Faculty Member",
  "Principal",
  "Vice Principal",
  "Office Administrator",
  "Accountant",
  "Kitchen Staff",
  "Cleaner",
  "Maintenance Staff",
];

export const COMMON_ADDITIONAL_ROLES = [
  "Principal",
  "Vice Principal",
  "Class Teacher",
  "Exam Coordinator",
  "Department Head",
  "Academic Coordinator",
  "Hostel Warden",
  "Discipline In-Charge",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null;
}

export default function StaffFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: Props) {
  const isEdit = Boolean(initialData?.id);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState<string>("Teaching / Academic");
  const [designation, setDesignation] = useState("");
  const [employmentType, setEmploymentType] = useState<"Full-Time" | "Part-Time">("Full-Time");
  const [joiningDate, setJoiningDate] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState<"Currently Employed" | "Former Staff">(
    "Currently Employed"
  );
  const [leavingDate, setLeavingDate] = useState("");
  const [salary, setSalary] = useState<string>("");
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([]);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [remarks, setRemarks] = useState("");

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>("");
  const [removePhoto, setRemovePhoto] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate or reset form
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (initialData) {
      setFullName(initialData.full_name || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setDepartment(initialData.department || "Teaching / Academic");
      setDesignation(initialData.designation || "");
      setEmploymentType(initialData.employment_type || "Full-Time");
      setJoiningDate(initialData.joining_date || "");
      setEmploymentStatus(initialData.employment_status || "Currently Employed");
      setLeavingDate(initialData.leaving_date || "");
      setSalary(initialData.salary !== null && initialData.salary !== undefined ? String(initialData.salary) : "");
      
      let roles: string[] = [];
      if (Array.isArray(initialData.additional_roles)) {
        roles = initialData.additional_roles;
      } else if (typeof initialData.additional_roles === "string") {
        try {
          const parsed = JSON.parse(initialData.additional_roles);
          roles = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          roles = initialData.additional_roles.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }
      setAdditionalRoles(roles);

      setRemarks(initialData.remarks || "");
      setExistingPhotoUrl(initialData.photo_url || "");
      setPhotoPreview(initialData.photo_url || "");
      setRemovePhoto(false);
      setPhotoFile(null);
    } else {
      resetForm();
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setDepartment("Teaching / Academic");
    setDesignation("");
    setEmploymentType("Full-Time");
    setJoiningDate("");
    setEmploymentStatus("Currently Employed");
    setLeavingDate("");
    setSalary("");
    setAdditionalRoles([]);
    setCustomRoleInput("");
    setRemarks("");
    setPhotoFile(null);
    setPhotoPreview("");
    setExistingPhotoUrl("");
    setRemovePhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size exceeds the maximum limit of 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    setRemovePhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!additionalRoles.includes(trimmed)) {
      setAdditionalRoles((prev) => [...prev, trimmed]);
    }
    setCustomRoleInput("");
  };

  const handleToggleRoleChip = (role: string) => {
    if (additionalRoles.includes(role)) {
      setAdditionalRoles((prev) => prev.filter((r) => r !== role));
    } else {
      setAdditionalRoles((prev) => [...prev, role]);
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setAdditionalRoles((prev) => prev.filter((r) => r !== roleToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone Number is required.");
      return;
    }
    if (!department) {
      toast.error("Department is required.");
      return;
    }
    if (!designation.trim()) {
      toast.error("Designation / Job Title is required.");
      return;
    }
    if (employmentStatus === "Former Staff" && !leavingDate) {
      toast.error("Working Till / Leaving Date is required for former staff.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("phone", phone.trim());
      if (email.trim()) formData.append("email", email.trim());
      formData.append("department", department);
      formData.append("designation", designation.trim());
      formData.append("employment_type", employmentType);
      if (joiningDate) formData.append("joining_date", joiningDate);
      formData.append("employment_status", employmentStatus);
      if (employmentStatus === "Former Staff" && leavingDate) {
        formData.append("leaving_date", leavingDate);
      }
      if (salary !== "" && salary !== null && salary !== undefined) {
        formData.append("salary", salary);
      }
      formData.append("additional_roles", JSON.stringify(additionalRoles));
      if (remarks.trim()) formData.append("remarks", remarks.trim());

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (isEdit && initialData?.id) {
        if (removePhoto) {
          formData.append("remove_photo", "true");
        }
        await apiClient.patch(`/staff/${initialData.id}`, formData);
        toast.success("Staff profile updated successfully!");
      } else {
        await apiClient.post("/staff", formData);
        toast.success("Staff member registered successfully!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        `Failed to ${isEdit ? "update" : "create"} staff record`;
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                {isEdit ? "Edit Staff / Faculty Member" : "Add Staff / Faculty Member"}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEdit
                  ? "Update professional record, department, designation, and roles."
                  : "Enter staff personal information, department, job title, and responsibilities."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
              <User size={16} className="text-neutral-700" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Personal Information
              </h3>
            </div>

            {/* Photo Upload with Preview */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <div className="relative w-20 h-20 rounded-xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                {photoPreview && !removePhoto ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-neutral-300" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">Staff Profile Photo</h4>
                  <p className="text-[11px] text-neutral-400">
                    JPG, JPEG, PNG or WEBP (Max 5 MB). Optional.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="staff-photo-input"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="staff-photo-input"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload size={13} />
                    <span>{photoPreview && !removePhoto ? "Replace Photo" : "Upload Photo"}</span>
                  </label>

                  {((photoPreview && !removePhoto) || existingPhotoUrl) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Abdul Rahman, Prof. Fatima"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[11px] font-normal text-neutral-400">Optional</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="e.g. staff.member@wmoiga.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Department & Employment */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
              <Building size={16} className="text-neutral-700" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Department & Employment Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                  {DEPARTMENT_OPTIONS.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {(["Full-Time", "Part-Time"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEmploymentType(type)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        employmentType === type
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Designation / Job Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Designation / Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Faculty Member, Arabic Teacher, Accountant"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />

                {/* Quick suggestions */}
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-neutral-400">Suggestions:</span>
                  {COMMON_DESIGNATIONS.map((desig) => (
                    <button
                      key={desig}
                      type="button"
                      onClick={() => setDesignation(desig)}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                    >
                      {desig}
                    </button>
                  ))}
                </div>
              </div>

              {/* Joining Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Joining Date</span>
                  <span className="text-[11px] font-normal text-neutral-400">Optional</span>
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Monthly Salary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Monthly Salary</span>
                  <span className="text-[11px] font-normal text-neutral-400">Optional</span>
                </label>
                <div className="relative">
                  <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="e.g. 45000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Employment Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Employment Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={employmentStatus}
                  onChange={(e) => {
                    const val = e.target.value as "Currently Employed" | "Former Staff";
                    setEmploymentStatus(val);
                    if (val === "Currently Employed") {
                      setLeavingDate("");
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                  <option value="Currently Employed">Currently Employed (Active / Present)</option>
                  <option value="Former Staff">Former Staff</option>
                </select>
              </div>

              {/* Working Till / Leaving Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Working Till / Leaving Date</span>
                  {employmentStatus === "Former Staff" ? (
                    <span className="text-red-500 text-xs font-bold">* Required</span>
                  ) : (
                    <span className="text-emerald-700 text-[11px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Present
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="date"
                    disabled={employmentStatus === "Currently Employed"}
                    required={employmentStatus === "Former Staff"}
                    value={leavingDate}
                    onChange={(e) => setLeavingDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
                {employmentStatus === "Currently Employed" && (
                  <p className="text-[11px] text-neutral-400">
                    Automatically marked as "Present" for active staff.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Additional Roles & Responsibilities */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
              <Briefcase size={16} className="text-neutral-700" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Additional Roles & Responsibilities
              </h3>
            </div>

            <p className="text-xs text-neutral-500">
              Staff members can hold additional duties independently from their department or designation. Select from common roles or add custom responsibilities.
            </p>

            {/* Quick Chips to toggle */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ADDITIONAL_ROLES.map((role) => {
                const isSelected = additionalRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleToggleRoleChip(role)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{role}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other custom responsibility..."
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomRole();
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddCustomRole}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors shrink-0"
              >
                <Plus size={14} className="inline mr-1" />
                Add
              </button>
            </div>

            {/* Selected Roles Badges */}
            {additionalRoles.length > 0 && (
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Assigned Additional Roles ({additionalRoles.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {additionalRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-neutral-800 border border-neutral-200 shadow-xs"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Remarks / Additional Information */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
              <span>Remarks & Notes</span>
              <span className="text-[11px] font-normal text-neutral-400">Optional</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Educational background, special achievements, emergency contact or administrative notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? "Saving..." : isEdit ? "Update Staff" : "Add Staff Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
