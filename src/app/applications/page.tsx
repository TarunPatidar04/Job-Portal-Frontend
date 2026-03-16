"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyApplications } from "@/lib/api";

interface Application {
  id?: string | number;
  application_id?: string | number;
  job_id?: string | number;
  jobId?: string | number;
  job_title?: string;
  title?: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  status?: string;
  created_at?: string;
  applied_at?: string;
}

export default function JobSeekerApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isJobSeeker = user?.role?.toLowerCase() === "jobseeker";

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyApplications();
      setApplications(res.applications || res.data || []);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isJobSeeker) {
      void loadApplications();
    } else if (user && !isJobSeeker) {
      router.replace("/");
    }
  }, [isJobSeeker, user, router]);

  if (!user || !isJobSeeker) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">My Applied Jobs</h1>

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
          <p className="text-slate-600 text-lg font-medium">You have not applied for any jobs yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app, index) => {
            return (
              <div 
                key={app.id || app.application_id || index} 
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/jobs/${app.job_id || app.jobId}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-slate-900">{app.job_title || app.title || `Application #${app.id}`}</h3>
                    <p className="text-slate-500 mt-1">{app.company_name || "Company"}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        📍 {app.location || "Location"}
                      </span>
                      <span className="flex items-center gap-1">
                        💼 {app.job_type || "Job Type"}
                      </span>
                      <span className="flex items-center gap-1">
                        📅 Applied: {app.created_at || app.applied_at ? 
                          new Date(app.created_at || app.applied_at!).toLocaleDateString() : 
                          'Not specified'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      app.status === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status || 'pending'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${app.job_id || app.jobId}`);
                      }}
                      className="rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      View Job
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}