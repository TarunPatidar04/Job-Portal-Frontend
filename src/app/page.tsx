"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/lib/api";
import { JobCard, JobSummary } from "@/components/JobCard";
import { JobSearchForm } from "@/components/JobSearchForm";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ title?: string; location?: string }>({});

  const loadJobs = async (filtersParam: { title?: string; location?: string } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getJobs(filtersParam);
      setJobs(response.jobs || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs(filters);
  }, [filters]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mx-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Find Your Dream Job
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Discover amazing opportunities from top companies. Browse, apply, and track your applications all in one place.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <JobSearchForm
          onSearch={(newFilters) => {
            setFilters(newFilters);
          }}
        />
      </div>

      {/* Jobs Section */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700">Loading jobs...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <div className="text-red-500 mb-2 text-4xl">⚠️</div>
          <p className="text-red-700 font-medium text-lg">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filters.title || filters.location ? 'Search Results' : 'Latest Jobs'}
            </h2>
            <p className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onApplied={() => {
                  void loadJobs(filters);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
