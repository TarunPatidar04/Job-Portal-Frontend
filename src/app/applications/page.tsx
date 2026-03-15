"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyApplications } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email: string;
  status: string;
  resume: string;
  applied_at: string;
  subscribed: boolean;
  job_title: string;
  job_salary: string;
  job_location: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyApplications();
      setApplications(response.applications || []);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user.role !== "jobseeker") {
      router.replace("/recruiter/dashboard");
      return;
    }

    void loadApplications();
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700">
        Please log in to view your applications.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
        <p className="mt-2 text-slate-600">
          Track the jobs you&apos;ve applied for.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          Loading applications...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
          <p className="text-lg mb-2">No applications yet</p>
          <p className="text-sm">You haven&apos;t applied for any jobs yet. Start browsing jobs to apply!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div
              key={app.application_id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {app.job_title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {app.job_location} • ₹{parseFloat(app.job_salary)?.toLocaleString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  app.status === 'Hired'
                    ? 'bg-emerald-100 text-emerald-800'
                    : app.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Applied on {new Date(app.applied_at).toLocaleDateString()}
              </p>
              {app.subscribed && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  ⭐ Priority applicant
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
