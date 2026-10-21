"use client";

import React, { useState, useEffect } from "react";
import { X, User, Calendar, BookOpen, MapPin, Phone, Mail, Award, Download, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";

interface Props {
  isOpen: boolean;
  studentId: number | null;
  onClose: () => void;
}

export default function StudentProfileModal({ isOpen, studentId, onClose }: Props) {
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"profile" | "examinations">("profile");

  useEffect(() => {
    if (!isOpen || !studentId) return;

    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/students/${studentId}`);
        if (res.data?.data) {
          setStudent(res.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch student details", err);
        toast.error("Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const downloadHallTicket = async (examId: number, examName: string) => {
    const loadingToast = toast.loading("Downloading Hall Ticket PDF...");
    try {
      const response = await apiClient.get(`/examinations/${examId}/hall_ticket/${studentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `HallTicket_${student?.admission_number}_${examName.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.update(loadingToast, { render: "Hall Ticket Downloaded!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, { render: "Failed to download Hall Ticket", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const downloadMarkList = async (examId: number, examName: string) => {
    const loadingToast = toast.loading("Downloading Mark List PDF...");
    try {
      const response = await apiClient.get(`/examinations/${examId}/marks/${studentId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `MarkList_${student?.admission_number}_${examName.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.update(loadingToast, { render: "Mark List Downloaded!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, { render: "Failed to download Mark List", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Black and White */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold truncate">Student Profile</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">Official student record and academic examination tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-neutral-200 bg-neutral-50/50 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-all border-b-2 ${
              activeTab === "profile"
                ? "border-neutral-900 text-neutral-900 bg-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Personal & Academic Info
          </button>
          <button
            onClick={() => setActiveTab("examinations")}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-all border-b-2 ${
              activeTab === "examinations"
                ? "border-neutral-900 text-neutral-900 bg-white"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Examinations & Results
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 min-h-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-neutral-500">
              <div className="w-7 h-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading student profile data...
            </div>
          ) : !student ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Failed to load student data.
            </div>
          ) : activeTab === "profile" ? (
            /* Profile View */
            <div className="space-y-6">
              {/* Identity Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="w-20 h-20 rounded-lg bg-white border border-neutral-300 overflow-hidden flex items-center justify-center shrink-0">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className="text-neutral-300" />
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold text-neutral-900">{student.full_name}</h3>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                      {student.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                    <span className="font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                      {student.admission_number}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="font-medium text-neutral-800">Class: {student.class_name}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-600">Batch {`${student.admission_year}/${String(student.admission_year + 1).slice(-2)}`}</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Date of Birth (Login Credential)
                  </div>
                  <div className="font-medium text-sm text-neutral-900 flex items-center gap-2">
                    <Calendar size={15} className="text-neutral-400" />
                    <span>{student.date_of_birth}</span>
                  </div>
                </div>

                <div className="p-3.5 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Father's Name
                  </div>
                  <div className="font-medium text-sm text-neutral-900">
                    {student.father_name || "-"}
                  </div>
                </div>

                <div className="p-3.5 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Place / Address
                  </div>
                  <div className="font-medium text-sm text-neutral-900 flex items-center gap-2">
                    <MapPin size={15} className="text-neutral-400" />
                    <span>{student.place || "-"}</span>
                  </div>
                </div>

                <div className="p-3.5 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Guardian Phone
                  </div>
                  <div className="font-medium text-sm text-neutral-900 flex items-center gap-2">
                    <Phone size={15} className="text-neutral-400" />
                    <span>{student.guardian_contact || "-"}</span>
                  </div>
                </div>

                <div className="p-3.5 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Alternative Phone
                  </div>
                  <div className="font-medium text-sm text-neutral-900 flex items-center gap-2">
                    <Phone size={15} className="text-neutral-400" />
                    <span>{student.alt_phone || "-"}</span>
                  </div>
                </div>

                <div className="p-3.5 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    Email Address
                  </div>
                  <div className="font-medium text-sm text-neutral-900 flex items-center gap-2">
                    <Mail size={15} className="text-neutral-400" />
                    <span>{student.email || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Examinations & Historical Academic Records View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Registered Examination Cycles</h4>
                  <p className="text-xs text-neutral-500">
                    Semester-by-semester clearance, hall tickets, and published mark lists
                  </p>
                </div>
              </div>

              {!student.eligibilities || student.eligibilities.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 border border-dashed rounded-lg">
                  No examination participation records found for this student.
                </div>
              ) : (
                <div className="space-y-4">
                  {student.eligibilities.map((elig: any) => {
                    const exam = elig.examination;
                    const resRecord = student.results?.find((r: any) => r.examination_id === elig.examination_id);
                    const isEligible = elig.no_due_status === "Approved" && elig.fee_status === "Paid";

                    return (
                      <div
                        key={elig.id}
                        className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                          <div>
                            <div className="font-bold text-sm text-neutral-900">
                              {exam ? exam.name : `Examination Cycle #${elig.examination_id}`}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {exam?.academic_year} {exam?.semester ? `• ${exam.semester}` : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => downloadHallTicket(elig.examination_id, exam?.name || "Exam")}
                              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1.5"
                            >
                              <Download size={13} />
                              <span>Hall Ticket</span>
                            </button>

                            {resRecord && (
                              <button
                                onClick={() => downloadMarkList(elig.examination_id, exam?.name || "Exam")}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-md transition-colors flex items-center gap-1.5"
                              >
                                <Download size={13} />
                                <span>Mark Sheet</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status Matrix */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 block uppercase font-bold">No-Due Status</span>
                            <span className={`font-semibold ${elig.no_due_status === "Approved" ? "text-neutral-900" : "text-amber-700"}`}>
                              {elig.no_due_status}
                            </span>
                          </div>

                          <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Fee Status</span>
                            <span className={`font-semibold ${elig.fee_status === "Paid" ? "text-neutral-900" : "text-amber-700"}`}>
                              {elig.fee_status}
                            </span>
                          </div>

                          <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Hall Ticket</span>
                            <span className="font-semibold text-neutral-900">
                              {exam?.is_hall_ticket_published ? (isEligible ? "Available" : "Restricted") : "Unpublished"}
                            </span>
                          </div>

                          <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Academic Result</span>
                            <span className="font-semibold text-neutral-900">
                              {resRecord ? `${resRecord.total_marks_obtained} (${resRecord.is_passed ? "Passed" : "Failed"})` : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
