"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createCompany,
  createJob,
  getCompanyDetails,
  getMyCompanies,
} from "@/lib/api";

interface Company {
  company_id?: number;
  id?: number;
  name: string;
  description: string;
  website: string;
  logo_url?: string;
}

interface Job {
  job_id?: number;
  id?: number;
  title: string;
  description: string;
  salary?: string;
  location: string;
  job_type: string;
  work_location: string;
  role: string;
  openings?: string;
  application_count?: number;
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newCompany, setNewCompany] = useState({ name: "", description: "", website: "" });
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  const [newJob, setNewJob] = useState({
    title: "", description: "", salary: "", location: "",
    role: "", job_type: "", work_location: "", openings: ""
  });

  const isRecruiter = user?.role?.toLowerCase() === "recruiter";

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await getMyCompanies();
      setCompanies(res.companies || []);
      
      // Automatically load jobs for the first company
      if (res.companies && res.companies.length > 0) {
        const firstCompanyId = res.companies[0].company_id || res.companies[0].id;
        await loadCompanyDetails(firstCompanyId as number);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId: number) => {
    setSelectedCompanyId(companyId);
    try {
      const res = await getCompanyDetails(companyId.toString());
      // Handle different response structures
      const jobsData = res.companyData?.jobs || res.jobs || [];
      setJobs(jobsData);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load company details");
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.description || !newCompany.website || !companyLogo) {
      setError("Please fill all fields and upload a logo");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createCompany({
        name: newCompany.name,
        description: newCompany.description,
        website: newCompany.website,
        logoFile: companyLogo,
      });
      
      // Reset form
      setNewCompany({ name: "", description: "", website: "" });
      setCompanyLogo(null);
      
      // Reload companies
      await loadCompanies();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !newJob.title || !newJob.description || !newJob.location || !newJob.role || !newJob.job_type || !newJob.work_location) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createJob({
        title: newJob.title,
        description: newJob.description,
        salary: newJob.salary,
        location: newJob.location,
        role: newJob.role,
        job_type: newJob.job_type,
        work_location: newJob.work_location,
        openings: newJob.openings,
        company_id: selectedCompanyId.toString(),
      });
      
      // Reset form
      setNewJob({
        title: "", description: "", salary: "", location: "",
        role: "", job_type: "", work_location: "", openings: ""
      });
      
      // Reload jobs
      await loadCompanyDetails(selectedCompanyId);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create job");
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your companies and job postings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/recruiter/companies")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            🏢 Companies
          </button>
          <button
            onClick={() => router.push("/recruiter/jobs")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            💼 Posted Jobs
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-xl">🏢</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Companies</p>
              <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xl">💼</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Posted Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-xl">📋</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Applications</p>
              <p className="text-2xl font-bold text-slate-900">
                {jobs.reduce((total, job) => total + (job.application_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Company Selection */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Select Company</h2>
          
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No companies created yet.</p>
              <button
                onClick={() => router.push("/recruiter/companies")}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Create Company
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map((company) => (
                <div
                  key={company.company_id || company.id}
                  onClick={() => loadCompanyDetails((company.company_id || company.id) as number)}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedCompanyId === (company.company_id || company.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {company.logo_url && (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900">{company.name}</h3>
                      <p className="text-sm text-slate-500">{company.website}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Posting Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Post New Job</h2>
          
          {!selectedCompanyId ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Please select a company first.</p>
            </div>
          ) : (
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Job description, requirements, etc."
                  required
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Salary</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 800000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Mumbai, Remote"
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={newJob.role}
                    onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Type</label>
                  <select
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Work Location</label>
                  <select
                    value={newJob.work_location}
                    onChange={(e) => setNewJob({ ...newJob, work_location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select work location</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Openings</label>
                  <input
                    type="text"
                    value={newJob.openings}
                    onChange={(e) => setNewJob({ ...newJob, openings: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Recent Jobs */}
      {selectedCompanyId && jobs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Jobs</h2>
            <button
              onClick={() => router.push("/recruiter/jobs")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View All Jobs
            </button>
          </div>
          <div className="space-y-4">
            {jobs.slice(0, 3).map((job) => {
              const currentJobId = job.job_id || job.id;
              return (
                <div key={currentJobId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.location} • {job.job_type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/jobs/${currentJobId}`)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/recruiter/applications/${currentJobId}`)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Applications
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
