"use client";

import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  Calendar,
  IndianRupee,
  Clock,
  Pencil,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staff: any | null;
  onEdit: (staff: any) => void;
}

export default function StaffDetailsModal({
  isOpen,
  onClose,
  staff,
  onEdit,
}: Props) {
  if (!isOpen || !staff) return null;

  const isCurrent = staff.employment_status === "Currently Employed";

  const formatCurrency = (val: any) => {
    if (val === null || val === undefined || val === "") return "Not Specified";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  let roles: string[] = [];
  if (Array.isArray(staff.additional_roles)) {
    roles = staff.additional_roles;
  } else if (typeof staff.additional_roles === "string") {
    try {
      const parsed = JSON.parse(staff.additional_roles);
      roles = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      roles = staff.additional_roles.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Banner */}
        <div className="relative p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
              {staff.photo_url ? (
                <img
                  src={staff.photo_url}
                  alt={staff.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-neutral-300" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isCurrent
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle size={11} />
                      <span>Currently Employed</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={11} />
                      <span>Former Staff</span>
                    </>
                  )}
                </span>

                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-200 border border-white/20">
                  {staff.employment_type || "Full-Time"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {staff.full_name}
              </h2>

              <p className="text-xs text-neutral-300 font-medium">
                {staff.designation} • {staff.department}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} className="text-neutral-700" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0">
                  <Phone size={15} />
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Phone</span>
                  <a
                    href={`tel:${staff.phone}`}
                    className="text-xs font-bold text-neutral-900 hover:underline truncate block"
                  >
                    {staff.phone}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0">
                  <Mail size={15} />
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Email</span>
                  {staff.email ? (
                    <a
                      href={`mailto:${staff.email}`}
                      className="text-xs font-bold text-neutral-900 hover:underline truncate block"
                    >
                      {staff.email}
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-neutral-700" />
              <span>Employment & Service Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Department</span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                  {staff.department}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Designation</span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                  {staff.designation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Monthly Salary</span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                  {formatCurrency(staff.salary)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Joining Date</span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                  {formatDate(staff.joining_date)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Service Tenure</span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                  {staff.joining_date ? formatDate(staff.joining_date) : "Start"} –{" "}
                  {isCurrent ? (
                    <span className="text-emerald-700 font-bold">Present (Active)</span>
                  ) : (
                    formatDate(staff.leaving_date)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Roles & Responsibilities */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-neutral-700" />
              <span>Additional Roles & Responsibilities</span>
            </h3>

            {roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                No additional responsibilities assigned to this staff member.
              </p>
            )}
          </div>

          {/* Remarks */}
          {staff.remarks && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-neutral-700" />
                <span>Remarks & Administrative Notes</span>
              </h3>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                {staff.remarks}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-neutral-100 bg-neutral-50/70 shrink-0">
          <span className="text-[11px] text-neutral-400">
            Registered: {formatDate(staff.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(staff);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Pencil size={13} />
              <span>Edit Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
