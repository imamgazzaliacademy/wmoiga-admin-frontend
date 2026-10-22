"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  Star,
  Award,
  ExternalLink,
  BookOpen,
  Building,
  GraduationCap,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alumnus: any | null;
  onEdit?: (alumnus: any) => void;
}

export default function AlumniDetailsModal({
  isOpen,
  onClose,
  alumnus,
  onEdit,
}: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [alumnus]);

  if (!isOpen || !alumnus) return null;

  const photo = alumnus.photo_url || alumnus.image || alumnus.photo;
  const isFeatured = Boolean(alumnus.is_featured || alumnus.isFeatured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Clean Modal Header - No negative margin overlaps */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-primary to-primary-hover text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Alumni Profile
              </h2>
              <p className="text-xs text-white/80">
                Official graduated student directory and career record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0">
          {/* Identity & Photo Card - Fully Visible & Responsively Aligned */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 sm:p-5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 shadow-2xs">
            {/* Dedicated Profile Photo Container with Full Visibility */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-neutral-200/90 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              {photo && !imageError ? (
                <img
                  src={photo}
                  alt={alumnus.full_name || alumnus.name || "Alumni Photo"}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                  <User size={44} className="text-neutral-400" />
                </div>
              )}
            </div>

            {/* Identity Details */}
            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                  {alumnus.full_name || alumnus.name}
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                {alumnus.batch && (
                  <span className="font-semibold px-2.5 py-0.5 rounded-md bg-neutral-900 text-white shadow-2xs">
                    {alumnus.batch} Batch
                  </span>
                )}
                {alumnus.admission_year && alumnus.passed_year && (
                  <span className="text-neutral-500 font-medium">
                    ({alumnus.admission_year} – {alumnus.passed_year})
                  </span>
                )}
                {isFeatured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-md shadow-2xs">
                    <Star size={11} fill="currentColor" />
                    Featured
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 bg-neutral-100 text-neutral-600 font-medium rounded-md">
                    Standard
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-primary truncate pt-0.5">
                {alumnus.current_position || alumnus.profession || "Alumni"}
              </p>
            </div>
          </div>

          {/* Current Engagement & Position Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Briefcase size={14} className="text-primary" />
              <span>Current Engagement & Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-0.5">
                  Category
                </span>
                <span className="font-bold text-neutral-900">
                  {alumnus.current_position || alumnus.profession || "Alumni"}
                </span>
              </div>

              {(alumnus.designation || alumnus.role) && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-0.5">
                    Designation / Role
                  </span>
                  <span className="font-bold text-neutral-900">
                    {alumnus.designation || alumnus.role}
                  </span>
                </div>
              )}

              {(alumnus.organization || alumnus.institution_name || alumnus.business_name) && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-0.5">
                    Organization / Institution / Venture
                  </span>
                  <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Building size={14} className="text-neutral-500 shrink-0" />
                    {alumnus.organization || alumnus.institution_name || alumnus.business_name}
                  </span>
                </div>
              )}

              {alumnus.course_name && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-0.5">
                    Course / Degree
                  </span>
                  <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-neutral-500 shrink-0" />
                    {alumnus.course_name}
                  </span>
                </div>
              )}

              {alumnus.exam_name && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-0.5">
                    Target Examination
                  </span>
                  <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Award size={14} className="text-neutral-500 shrink-0" />
                    {alumnus.exam_name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                Contact Information
              </span>
              <div className="space-y-2 text-xs text-neutral-700">
                <a
                  href={`mailto:${alumnus.email}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors p-2.5 bg-neutral-50 rounded-lg border border-neutral-100"
                >
                  <Mail size={15} className="text-primary shrink-0" />
                  <span className="truncate">{alumnus.email || "No email provided"}</span>
                </a>
                <a
                  href={`tel:${alumnus.phone}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors p-2.5 bg-neutral-50 rounded-lg border border-neutral-100"
                >
                  <Phone size={15} className="text-primary shrink-0" />
                  <span>{alumnus.phone || "No phone provided"}</span>
                </a>
                {alumnus.linkedin && (
                  <a
                    href={alumnus.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:text-primary transition-colors p-2.5 bg-neutral-50 rounded-lg border border-neutral-100"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <ExternalLink size={15} className="text-primary shrink-0" />
                      <span className="truncate">LinkedIn Profile</span>
                    </span>
                    <ExternalLink size={12} className="text-neutral-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Location & Academic Details */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                Location & Domain
              </span>
              <div className="space-y-2 text-xs text-neutral-700">
                <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <MapPin size={15} className="text-amber-500 shrink-0" />
                  <span>{alumnus.location || "Location not specified"}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Award size={15} className="text-primary shrink-0" />
                  <span>Domain / Field: {alumnus.field || "General"}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Calendar size={15} className="text-neutral-500 shrink-0" />
                  <span>
                    Admission: {alumnus.admission_year || "—"} | Graduated: {alumnus.passed_year || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements / Highlights */}
          {alumnus.achievements && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                Notable Achievements & Story
              </span>
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {alumnus.achievements}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 border-t border-neutral-100 bg-neutral-50/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(alumnus);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-xs cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
