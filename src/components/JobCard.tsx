"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { applyForJob } from "@/lib/api";
import { useState } from "react";

export interface JobSummary {
  job_id: number;
  title: string;
  description: string;
  salary?: string;
  location?: string;
  job_type?: string;
  role?: string;
  work_location?: string;
  created_at?: string;
  company_name?: string;
  company_logo?: string;
  company_id?: number;
}

export function JobCard({ job, onApplied }: { job: JobSummary; onApplied?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleApply = async () => {
    if (!user) {
      setMessage("Please login to apply for this job.");
      return;
    }

    if (user.role?.toLowerCase() !== "jobseeker") {
      setMessage("Only jobseekers can apply for jobs.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await applyForJob(String(job.job_id));
      setMessage("Application submitted successfully.");
      onApplied?.();
    } catch (error: unknown) {
      setMessage((error as Error)?.message || "Failed to apply for job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{job.title}</h2>
          <p className="text-base text-gray-700 font-medium mb-3">{job.company_name}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {job.location && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-base">📍</span> {job.location}
              </span>
            )}
            {job.job_type && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-base">💼</span> {job.job_type}
              </span>
            )}
            {job.work_location && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-base">🏢</span> {job.work_location}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {job.salary && (
            <div className="bg-gray-100 rounded-lg px-3 py-2 border border-gray-300">
              <p className="text-lg font-bold text-gray-900">₹{parseFloat(job.salary).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 line-clamp-3 mb-6 leading-relaxed">{job.description}</p>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/jobs/${job.job_id}`}
          className="flex-1 text-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
        >
          View Details
        </Link>
        {user && user.role?.toLowerCase() === "jobseeker" && (
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-black transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Applying...
              </span>
            ) : (
              "Apply Now"
            )}
          </button>
        )}
      </div>

      {message && (
        <div className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
          message.includes('successfully')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </article>
  );
}
