"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getJobApplications, updateApplicationStatus } from "@/lib/api";

interface Application {
  application_id?: string | number;
  applicant_id?: string | number;
  applicant_email?: string;
  applicant_name?: string;
  jobseeker_name?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  status?: string;
  created_at?: string;
  applied_at?: string;
  resume?: string;
  subscribed?: boolean;
  job_id?: string | number;
}

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  console.log("applications", applications);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");

  const isRecruiter = user?.role?.toLowerCase() === "recruiter";

  const loadApplications = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await getJobApplications(id as string);
      setApplications(res.applications || res.data || []);
      setJobTitle(res.jobTitle || "Job");
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string | number, status: string) => {
    try {
      await updateApplicationStatus(applicationId.toString(), status);
      await loadApplications(); // Reload to show updated status
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update application status");
    }
  };

  useEffect(() => {
    if (isRecruiter) {
      void loadApplications();
    } else if (user) {
      router.replace("/");
    }
  }, [isRecruiter, user, id]);

  if (!user || !isRecruiter) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Applications</h1>
          <p className="text-slate-600 mt-1">{jobTitle}</p>
        </div>
        <button
          onClick={() => router.push("/recruiter/dashboard")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-gray-50 p-16 text-center shadow-sm">
          <p className="text-slate-600 text-lg font-medium">No applications received yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.application_id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {application.applicant_name?.[0] || "U"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">
                        {application.applicant_name || "Unknown Applicant"}
                      </h3>
                      <p className="text-sm text-slate-500">{application.applicant_email || application.email || "No email"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Phone:</span>
                      <span className="ml-2 text-slate-600">{application.phone_number || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Applied:</span>
                      <span className="ml-2 text-slate-600">
                        {application.created_at || application.applied_at ? 
                          new Date(application.created_at || application.applied_at!).toLocaleDateString() : 
                          'Not specified'
                        }
                      </span>
                    </div>
                    {application.bio && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-slate-700">Bio:</span>
                        <p className="mt-1 text-slate-600">{application.bio}</p>
                      </div>
                    )}
                    {application.resume && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-slate-700">Resume:</span>
                        <div className="mt-1">
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                          >
                            📄 View Resume
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                  <div className="text-center">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      application.status === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {application.status || 'pending'}
                    </span>
                  </div>
                  
                  {application.status !== 'hired' && application.status !== 'rejected' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(application.application_id!, 'hired')}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Hire
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application.application_id!, 'rejected')}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
