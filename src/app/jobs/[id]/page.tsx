"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { applyForJob, getJob, getMyApplications } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Job {
  job_id: number;
  title: string;
  description: string;
  salary?: string;
  location: string;
  job_type: string;
  work_location: string;
  role: string;
  openings?: string;
  company_name: string;
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  interface Application {
  id?: string | number;
  application_id?: string | number;
  name?: string;
  jobseeker_name?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  status?: string;
  created_at?: string;
  applied_at?: string;
  job_id?: string | number;
  jobId?: string | number;
  job_title?: string;
  title?: string;
  company_name?: string;
  location?: string;
  job_type?: string;
}

useEffect(() => {
    if (!id) return;

    const checkIfApplied = async () => {
      if (!id || user?.role !== "jobseeker") return;
      
      try {
        const res = await getMyApplications();
        const applications: Application[] = res.applications || res.data || [];
        const application = applications.find((app: Application) => 
          app.job_id === Number(id) || app.jobId === Number(id)
        );
        
        if (application) {
          setHasApplied(true);
          setApplicationStatus(application.status || 'Submitted');
        } else {
          setHasApplied(false);
          setApplicationStatus(null);
        }
      } catch {
        // If checking applications fails, assume not applied
        setHasApplied(false);
        setApplicationStatus(null);
      }
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getJob(id as string);
        setJob(response.job);
        await checkIfApplied();
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    setMessage(null);
    setError(null);
    try {
      await applyForJob(id as string);
      setMessage("Application submitted successfully.");
      setHasApplied(true); // Update applied status
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
        Loading job details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        Job not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
            <p className="text-lg text-slate-600 mb-3">
              {job.company_name}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                📍 {job.location}
              </span>
              <span className="flex items-center gap-1">
                💼 {job.job_type}
              </span>
              <span className="flex items-center gap-1">
                🏢 {job.work_location}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:min-w-[200px]">
            {job.salary && (
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center">
                <p className="text-sm font-medium text-emerald-700">Salary</p>
                <p className="text-xl font-bold text-emerald-900">
                  ₹{parseFloat(job.salary).toLocaleString()}
                </p>
              </div>
            )}
            {user && user.role === "jobseeker" ? (
              hasApplied ? (
                <div className={`rounded-lg border px-4 py-3 text-center ${
                  applicationStatus === 'Hired' ? 'border-emerald-200 bg-emerald-50' :
                  applicationStatus === 'Rejected' ? 'border-red-200 bg-red-50' :
                  'border-amber-200 bg-amber-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    applicationStatus === 'Hired' ? 'text-emerald-700' :
                    applicationStatus === 'Rejected' ? 'text-red-700' :
                    'text-amber-700'
                  }`}>
                    {applicationStatus === 'Hired' ? '🎉 Hired!' :
                     applicationStatus === 'Rejected' ? '❌ Application Rejected' :
                     '✓ Application Submitted'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                >
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Applying...
                    </span>
                  ) : (
                    "Apply for this job"
                  )}
                </button>
              )
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                Login as a jobseeker to apply
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Job Description</h2>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <p className="text-sm font-semibold text-slate-800">Role</p>
              </div>
              <p className="text-slate-700">{job.role}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👥</span>
                <p className="text-sm font-semibold text-slate-800">Openings</p>
              </div>
              <p className="text-slate-700">{job.openings ?? "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-4 text-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
