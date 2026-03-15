"use client";

import { useEffect, useState } from "react";
import { getJobApplications, updateApplicationStatus } from "@/lib/api";

export interface ApplicationData {
  application_id?: number | string;
  id?: number | string;
  _id?: number | string;
  applicant_name?: string;
  applicant_email?: string;
  status?: string;
  resume?: string;
  user?: {
    name?: string;
    email?: string;
    resume?: string;
  };
}

export function JobApplicationsPopup({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobApplications(jobId);
      setApplications((res.applications || res.data || []) as ApplicationData[]);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      void loadApplications();
    }
  }, [jobId]);

  const handleStatusUpdate = async (applicationId: string | number | undefined, status: string) => {
    if (!applicationId) return;
    try {
      await updateApplicationStatus(applicationId.toString(), status);
      setApplications((prev) =>
        prev.map((app) =>
          (app.application_id || app.id || app._id) === applicationId
            ? { ...app, status }
            : app
        )
      );
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to update status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">Job Applications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-3xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading applications...</p>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-gray-50 p-8 text-center">
              <p className="text-slate-500">No applications received for this job yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app, index) => {
                const appId = app.application_id || app.id || app._id;
                const applicantName = app.user?.name || app.applicant_name || "Unknown Applicant";
                const applicantEmail = app.user?.email || app.applicant_email || "No Email";
                const resumeLink = app.resume || app.user?.resume;
                const currentStatus = app.status || "Pending";

                return (
                  <div
                    key={appId || index}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow transition-shadow"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{applicantName}</h3>
                      <p className="text-slate-500 text-sm">{applicantEmail}</p>
                      {resumeLink && (
                        <a
                          href={resumeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm mt-2 inline-block font-medium"
                        >
                          View Resume
                        </a>
                      )}
                      <p className="text-sm mt-3">
                        Status:{" "}
                        <span
                          className={`font-semibold px-2 py-1 rounded-full text-xs ${
                            currentStatus.toLowerCase() === "hired" || currentStatus.toLowerCase() === "accepted"
                              ? "bg-green-100 text-green-700"
                              : currentStatus.toLowerCase() === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => handleStatusUpdate(appId, "Hired")} disabled={currentStatus.toLowerCase() === "hired" || currentStatus.toLowerCase() === "accepted"} className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                        Hire
                      </button>
                      <button onClick={() => handleStatusUpdate(appId, "Rejected")} disabled={currentStatus.toLowerCase() === "rejected"} className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}