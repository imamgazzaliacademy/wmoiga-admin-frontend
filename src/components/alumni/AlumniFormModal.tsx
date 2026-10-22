"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building,
  GraduationCap,
  MapPin,
  Star,
  Award,
  Link as LinkIcon,
  Loader2,
  Check,
} from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";

export const POSITION_OPTIONS = [
  "Pursuing Higher Studies",
  "Professional Course",
  "Employed / Full-Time / Part-Time",
  "Self-Employed / Entrepreneur / Business",
  "Serving in a Masjid / Islamic Institution / Social Platform",
  "Preparing for Competitive Exams / Entrance Exams",
] as const;

export type PositionType = typeof POSITION_OPTIONS[number];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null;
}

export default function AlumniFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: Props) {
  const isEdit = Boolean(initialData?.id);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [admissionYear, setAdmissionYear] = useState<string>("");
  const [passedYear, setPassedYear] = useState<string>("");
  const [batch, setBatch] = useState("");
  const [isBatchAuto, setIsBatchAuto] = useState(true);

  // Current Position
  const [currentPosition, setCurrentPosition] = useState<PositionType | "">("");

  // Position-Related Details
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [examName, setExamName] = useState("");

  // Featured and Public Profile Info
  const [isFeatured, setIsFeatured] = useState(false);
  const [location, setLocation] = useState("");
  const [field, setField] = useState("");
  const [achievements, setAchievements] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  // Reset or Populate Form
  useEffect(() => {
    if (!isOpen) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }

    if (initialData) {
      setFullName(initialData.full_name || initialData.name || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setAdmissionYear(initialData.admission_year ? String(initialData.admission_year) : "");
      setPassedYear(initialData.passed_year ? String(initialData.passed_year) : "");
      setBatch(initialData.batch || "");
      setIsBatchAuto(false);

      setCurrentPosition((initialData.current_position as PositionType) || "");
      setOrganization(initialData.organization || "");
      setDesignation(initialData.designation || "");
      setInstitutionName(initialData.institution_name || "");
      setCourseName(initialData.course_name || "");
      setBusinessName(initialData.business_name || "");
      setExamName(initialData.exam_name || "");

      setIsFeatured(Boolean(initialData.is_featured || initialData.isFeatured));
      setLocation(initialData.location || "");
      setField(initialData.field || "");
      setAchievements(initialData.achievements || initialData.achievement || "");
      setLinkedin(initialData.linkedin || "");

      const photo = initialData.photo_url || initialData.image || "";
      setExistingPhotoUrl(photo);
      setPhotoPreview(photo);
      setPhotoFile(null);
    } else {
      // Default Add State
      setFullName("");
      setEmail("");
      setPhone("");
      setAdmissionYear("");
      setPassedYear("");
      setBatch("");
      setIsBatchAuto(true);
      setCurrentPosition("Pursuing Higher Studies");
      setOrganization("");
      setDesignation("");
      setInstitutionName("");
      setCourseName("");
      setBusinessName("");
      setExamName("");
      setIsFeatured(false);
      setLocation("");
      setField("");
      setAchievements("");
      setLinkedin("");
      setPhotoFile(null);
      setPhotoPreview("");
      setExistingPhotoUrl("");
    }
  }, [isOpen, initialData]);

  // Automatically derive batch when admissionYear or passedYear changes
  useEffect(() => {
    if (!isBatchAuto && isEdit) return;

    if (admissionYear && passedYear) {
      setBatch(`${admissionYear}–${passedYear}`);
    } else if (passedYear) {
      setBatch(`Class of ${passedYear}`);
    } else if (admissionYear) {
      setBatch(`Batch ${admissionYear}`);
    }
  }, [admissionYear, passedYear, isBatchAuto, isEdit]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email address is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!currentPosition) {
      toast.error("Current position is required");
      return;
    }

    if (isFeatured) {
      if (!location.trim()) {
        toast.warning("Location is recommended for featured alumni");
      }
      if (!photoFile && !existingPhotoUrl) {
        toast.warning("A profile photo is required to showcase featured alumni on the website");
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());

      if (admissionYear) formData.append("admission_year", admissionYear);
      if (passedYear) formData.append("passed_year", passedYear);
      formData.append("batch", batch.trim() || `${admissionYear}–${passedYear}`);
      formData.append("current_position", currentPosition);

      // Position related fields
      if (organization.trim()) formData.append("organization", organization.trim());
      if (designation.trim()) formData.append("designation", designation.trim());
      if (institutionName.trim()) formData.append("institution_name", institutionName.trim());
      if (courseName.trim()) formData.append("course_name", courseName.trim());
      if (businessName.trim()) formData.append("business_name", businessName.trim());
      if (examName.trim()) formData.append("exam_name", examName.trim());

      // Featured & profile details
      formData.append("is_featured", String(isFeatured));
      if (location.trim()) formData.append("location", location.trim());
      if (field.trim()) formData.append("field", field.trim());
      if (achievements.trim()) formData.append("achievements", achievements.trim());
      if (linkedin.trim()) formData.append("linkedin", linkedin.trim());

      if (photoFile) {
        formData.append("image", photoFile);
      } else if (existingPhotoUrl) {
        formData.append("photo_url", existingPhotoUrl);
      }

      if (isEdit && initialData?.id) {
        await apiClient.patch(`/update_alumni/${initialData.id}`, formData);
        toast.success("Alumni profile updated successfully!");
      } else {
        await apiClient.post("/add_alumni", formData);
        toast.success("Alumni profile added successfully!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "add"} alumni profile`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {isEdit ? "Edit Alumni Profile" : "Add New Alumni"}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEdit
                  ? "Update alumni professional details and featured status"
                  : "Register a graduated student into the Alumni Directory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <User size={14} className="text-primary" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammed Ashique"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumnus@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Years & Batch */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              Academic Years & Batch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Admission Year
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2099"
                  value={admissionYear}
                  onChange={(e) => {
                    setAdmissionYear(e.target.value);
                    setIsBatchAuto(true);
                  }}
                  placeholder="e.g. 2015"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Graduation / Passed Year
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2099"
                  value={passedYear}
                  onChange={(e) => {
                    setPassedYear(e.target.value);
                    setIsBatchAuto(true);
                  }}
                  placeholder="e.g. 2023"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Batch <span className="text-neutral-400 font-normal">(Auto-derived)</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={batch}
                  onChange={(e) => {
                    setBatch(e.target.value);
                    setIsBatchAuto(false);
                  }}
                  placeholder="e.g. 2015–2023"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden bg-neutral-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Current Position & Dynamic Details */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Briefcase size={14} className="text-primary" />
              Current Position & Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Current Position Category <span className="text-red-500">*</span>
              </label>
              <select
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value as PositionType)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden bg-white"
                required
              >
                <option value="" disabled>
                  Select current position...
                </option>
                {POSITION_OPTIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Details based on Position */}
            {currentPosition === "Pursuing Higher Studies" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => {
                      setInstitutionName(e.target.value);
                      if (!organization) setOrganization(e.target.value);
                    }}
                    placeholder="e.g. Al-Azhar University, Cairo"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Course / Degree
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. MA Islamic Jurisprudence"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Specialization / Major
                  </label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. Usul al-Fiqh / Sharia"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
              </div>
            )}

            {currentPosition === "Professional Course" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Institution / Academy
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => {
                      setInstitutionName(e.target.value);
                      if (!organization) setOrganization(e.target.value);
                    }}
                    placeholder="e.g. ICAI / Institute Name"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Professional Course
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Chartered Accountancy / CMA"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Field / Specialization
                  </label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. Finance / Audit"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
              </div>
            )}

            {currentPosition === "Employed / Full-Time / Part-Time" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
              </div>
            )}

            {currentPosition === "Self-Employed / Entrepreneur / Business" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Business / Venture Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      if (!organization) setOrganization(e.target.value);
                    }}
                    placeholder="e.g. Al-Amana Digital Media"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Founder & Managing Director"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Business Industry
                  </label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. E-Commerce / Publishing"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
              </div>
            )}

            {currentPosition === "Serving in a Masjid / Islamic Institution / Social Platform" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Institution / Masjid Name
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => {
                      setInstitutionName(e.target.value);
                      if (!organization) setOrganization(e.target.value);
                    }}
                    placeholder="e.g. Grand Masjid, Wayanad"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Role / Capacity
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Khatib & Religious Scholar"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Field / Domain
                  </label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. Community Service / Da'wah"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
              </div>
            )}

            {currentPosition === "Preparing for Competitive Exams / Entrance Exams" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Target Examination / Service
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. UPSC Civil Services / Kerala PSC"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Coaching Institute / Academy
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => {
                      setInstitutionName(e.target.value);
                      if (!organization) setOrganization(e.target.value);
                    }}
                    placeholder="e.g. State Civil Service Academy"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-lg outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Featured Status & Website Showcase */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isFeatured ? "bg-amber-100 text-amber-600" : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  <Star size={18} fill={isFeatured ? "currentColor" : "none"} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Feature in "Successful Alumni"
                  </p>
                  <p className="text-xs text-neutral-500">
                    Display this alumni card in the public website's Featured Alumni showcase.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Profile Photo Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Profile Photo {isFeatured && <span className="text-amber-600">*</span>}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-neutral-300 overflow-hidden bg-neutral-50 flex items-center justify-center shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-neutral-400" />
                    )}
                  </div>
                  <label className="cursor-pointer px-3 py-2 border rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 shadow-xs">
                    <Upload size={14} />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Location (City / Country) {isFeatured && <span className="text-amber-600">*</span>}
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Wayanad, Kerala / Dubai, UAE"
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  LinkedIn Profile (Optional)
                </label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Achievements & Notable Story */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Achievements & Notable Story {isFeatured && <span className="text-amber-600">*</span>}
              </label>
              <textarea
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Highlight career milestones, academic awards, publications, or contributions to society..."
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEdit ? "Update Alumni" : "Create Alumni"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
