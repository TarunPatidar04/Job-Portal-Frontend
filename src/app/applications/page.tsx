"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function JobSeekerApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isJobSeeker = user?.role?.toLowerCase() === "jobseeker";

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Yaha par aap api call laga sakte hain jobseeker ki applied jobs nikalne ke liye
      // const res = await getMyApplications();
      // setApplications(res.data || []);
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
              <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="font-bold text-xl text-slate-900">{app.job_title || `Application #${app.id}`}</h3>
                 <p className="text-slate-500 mt-2">Status: {app.status}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}