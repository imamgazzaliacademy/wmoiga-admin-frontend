"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Clock, XCircle, Search, RefreshCw, CheckCheck, ShieldAlert, User } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_CLASSES } from "@/components/students/StudentRegistrationModal";

interface Props {
  isOpen: boolean;
  examinationId: number | null;
  examinationName: string;
  onClose: () => void;
}

export default function EligibilityManagementModal({
  isOpen,
  examinationId,
  examinationName,
  onClose,
}: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [eligibilities, setEligibilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterNoDue, setFilterNoDue] = useState("");
  const [filterFee, setFilterFee] = useState("");
  const [syncing, setSyncing] = useState(false);

  const fetchEligibilities = async () => {
    if (!examinationId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/examinations/${examinationId}/eligibility`, {
        params: {
          class_name: selectedClass === "all" ? undefined : selectedClass,
          search: search || undefined,
          no_due_status: filterNoDue || undefined,
          fee_status: filterFee || undefined,
          limit: 100,
        },
      });
      if (res.data?.data) {
        setEligibilities(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch eligibility records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && examinationId) {
      fetchEligibilities();
    }
  }, [isOpen, examinationId, selectedClass, search, filterNoDue, filterFee]);

  const handleSyncStudents = async () => {
    if (!examinationId) return;
    setSyncing(true);
    try {
      const res = await apiClient.post(`/examinations/${examinationId}/eligibility/initialize`, {
        class_name: selectedClass === "all" ? undefined : selectedClass,
      });
      toast.success(res.data?.message || "Students synced to examination cycle");
      fetchEligibilities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initialize eligibility");
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateStatus = async (
    studentId: number,
    field: "no_due_status" | "fee_status",
    value: string
  ) => {
    if (!examinationId) return;
    try {
      await apiClient.patch(`/examinations/${examinationId}/eligibility/${studentId}`, {
        [field]: value,
      });

      setEligibilities((prev) =>
        prev.map((item) =>
          item.student_id === studentId ? { ...item, [field]: value } : item
        )
      );
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleBulkApprove = async (type: "all_fees" | "all_nodues" | "all_both") => {
    if (!examinationId || eligibilities.length === 0) return;
    const studentIds = eligibilities.map((el) => el.student_id);

    try {
      const payload: any = { student_ids: studentIds };
      if (type === "all_fees" || type === "all_both") {
        payload.fee_status = "Paid";
      }
      if (type === "all_nodues" || type === "all_both") {
        payload.no_due_status = "Approved";
      }

      await apiClient.patch(`/examinations/${examinationId}/eligibility/bulk`, payload);
      toast.success(`Bulk updated ${studentIds.length} students`);
      fetchEligibilities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to bulk update");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header - Standard Black and White */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold">Examination Eligibility & Fee Clearance</h2>
            <p className="text-xs text-neutral-400">
              Examination: <span className="text-white font-semibold">{examinationName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Class Selection Tabs */}
        <div className="px-6 py-3 bg-neutral-50/50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Filter Class:
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedClass("all")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedClass === "all"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                }`}
              >
                All
              </button>
              {SUPPORTED_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls.value;
                return (
                  <button
                    key={cls.value}
                    onClick={() => setSelectedClass(cls.value)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                    }`}
                  >
                    {cls.value}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSyncStudents}
            disabled={syncing}
            className="px-3 py-1 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            <span>Sync Active Students</span>
          </button>
        </div>

        {/* Filter and Bulk Actions Bar */}
        <div className="p-4 bg-white border-b border-neutral-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by student name or admission no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none"
              />
            </div>

            <div>
              <select
                value={filterNoDue}
                onChange={(e) => setFilterNoDue(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-800"
              >
                <option value="">All No-Due Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={filterFee}
                onChange={(e) => setFilterFee(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 outline-none bg-white font-medium text-neutral-800"
              >
                <option value="">All Fee Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs">
            <span className="text-neutral-500">
              Showing <span className="font-bold text-neutral-900">{eligibilities.length}</span> students
            </span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600">Quick Bulk:</span>
              <button
                onClick={() => handleBulkApprove("all_nodues")}
                className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-medium transition-colors"
              >
                Approve All No-Dues
              </button>
              <button
                onClick={() => handleBulkApprove("all_fees")}
                className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-medium transition-colors"
              >
                Mark All Fees Paid
              </button>
              <button
                onClick={() => handleBulkApprove("all_both")}
                className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-black text-white font-medium transition-colors"
              >
                Approve Both (Eligible)
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-neutral-500">
              <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading eligibility records...
            </div>
          ) : eligibilities.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 border border-dashed rounded-lg space-y-2">
              <ShieldAlert size={32} className="mx-auto text-neutral-300" />
              <p className="font-semibold text-neutral-800">No eligibility records found</p>
              <p className="text-neutral-400">
                Click "Sync Active Students" above to initialize examination records for enrolled students.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                  <tr>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">No-Due Clearance</th>
                    <th className="p-3">Examination Fee</th>
                    <th className="p-3">Hall Ticket Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {eligibilities.map((elig) => {
                    const std = elig.student;
                    const isEligible = elig.no_due_status === "Approved" && elig.fee_status === "Paid";

                    return (
                      <tr key={elig.id} className="hover:bg-neutral-50/60">
                        <td className="p-3 font-mono font-bold text-neutral-900">
                          {std?.admission_number}
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-neutral-900">{std?.full_name}</span>
                        </td>

                        <td className="p-3 font-medium text-neutral-700">
                          {std?.class_name}
                        </td>

                        {/* No-Due Status Dropdown */}
                        <td className="p-3">
                          <select
                            value={elig.no_due_status}
                            onChange={(e) =>
                              handleUpdateStatus(elig.student_id, "no_due_status", e.target.value)
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold border outline-none ${
                              elig.no_due_status === "Approved"
                                ? "bg-neutral-100 text-neutral-900 border-neutral-300"
                                : elig.no_due_status === "Rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-neutral-50 text-neutral-700 border-neutral-200"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        {/* Fee Status Dropdown */}
                        <td className="p-3">
                          <select
                            value={elig.fee_status}
                            onChange={(e) =>
                              handleUpdateStatus(elig.student_id, "fee_status", e.target.value)
                            }
                            className={`px-2 py-1 rounded text-xs font-semibold border outline-none ${
                              elig.fee_status === "Paid"
                                ? "bg-neutral-100 text-neutral-900 border-neutral-300"
                                : elig.fee_status === "Rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-neutral-50 text-neutral-700 border-neutral-200"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        {/* Final Eligibility Indicator */}
                        <td className="p-3">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                              <CheckCircle size={12} />
                              <span>Eligible</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                              <Clock size={12} />
                              <span>Clearance Pending</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
