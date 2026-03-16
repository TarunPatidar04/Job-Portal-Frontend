"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyCompanies } from "@/lib/api";

export default function RecruiterJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRecruiter = user?.role?.toLowerCase() === "recruiter";

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await getMyCompanies();
      setCompanies(res.companies || []);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRecruiter) {
      void loadCompanies();
    } else if (user) {
      router.replace("/");
    }
  }, [isRecruiter, user, router]);

  if (!user || !isRecruiter) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Posted Jobs</h1>
          <p className="text-slate-600 mt-1">View and manage your job postings</p>
        </div>
        <button
          onClick={() => router.push("/recruiter/dashboard")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Dashboard
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
          <p className="text-slate-600 font-medium text-lg">Loading jobs...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-gray-50 p-16 text-center shadow-sm">
          <p className="text-slate-600 text-lg font-medium mb-4">No companies found.</p>
          <button
            onClick={() => router.push("/recruiter/companies")}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Create Company First
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {companies.map((company) => (
            <div key={company.company_id || company.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{company.name}</h2>
                  <p className="text-sm text-slate-500">{company.website}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">Posted Jobs</h3>
                  <button
                    onClick={() => router.push(`/recruiter/dashboard?company=${company.company_id || company.id}`)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    + Post New Job
                  </button>
                </div>
                
                {company.jobs && company.jobs.length > 0 ? (
                  <div className="grid gap-4">
                    {company.jobs.map((job: any) => (
                      <div key={job.job_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2">{job.title}</h4>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                📍 {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                💼 {job.job_type}
                              </span>
                              <span className="flex items-center gap-1">
                                🏢 {job.work_location}
                              </span>
                              {job.salary && (
                                <span className="flex items-center gap-1">
                                  💰 ₹{parseFloat(job.salary).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/jobs/${job.job_id}`)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => router.push(`/recruiter/applications/${job.job_id}`)}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                              Applications
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-gray-50 p-8 text-center">
                    <p className="text-slate-600 font-medium mb-4">No jobs posted yet for this company.</p>
                    <button
                      onClick={() => router.push(`/recruiter/dashboard?company=${company.company_id || company.id}`)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Post First Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
