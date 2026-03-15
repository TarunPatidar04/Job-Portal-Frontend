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

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
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
        await loadCompanyDetails(firstCompanyId);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCompanyDetails(companyId.toString());
      const jobsFromRes = Array.isArray(res.companyData?.jobs) ? res.companyData.jobs :
                          Array.isArray(res.company?.jobs) ? res.company.jobs :
                          Array.isArray(res.jobs) ? res.jobs :
                          Array.isArray(res.data?.jobs) ? res.data.jobs :
                          Array.isArray(res.data) ? res.data : [];
      setJobs(jobsFromRes);
      setSelectedCompanyId(companyId);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!companyLogo) {
      setError("Please select a company logo");
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
      setNewCompany({ name: "", description: "", website: "" });
      setCompanyLogo(null);
      await loadCompanies();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCompanyId) {
      setError("Please select a company first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createJob({
        ...newJob,
        company_id: selectedCompanyId.toString(),
      });
      setNewJob({
        title: "", description: "", salary: "", location: "",
        role: "", job_type: "", work_location: "", openings: "",
      });
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
  }, [isRecruiter, user]);

  if (!user || !isRecruiter) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Register Company</h2>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                required
                type="text"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                value={newCompany.description}
                onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input
                required
                type="url"
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Logo</label>
              <input
                required
                type="file"
                accept="image/*"
                onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Company"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Post a New Job</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Company</label>
                <select
                  required
                  value={selectedCompanyId || ""}
                  onChange={(e) => loadCompanyDetails(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="" disabled>Select a company</option>
                  {companies.map((c) => (
                    <option key={c.company_id || c.id} value={c.company_id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  required
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input
                  required
                  type="text"
                  value={newJob.role}
                  onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                <input
                  required
                  type="text"
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  required
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Openings</label>
                <input
                  required
                  type="number"
                  value={newJob.openings}
                  onChange={(e) => setNewJob({ ...newJob, openings: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Full-time"
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Location</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Remote, On-site"
                  value={newJob.work_location}
                  onChange={(e) => setNewJob({ ...newJob, work_location: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !selectedCompanyId}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>

      {selectedCompanyId && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Posted Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-slate-500">No jobs posted for this company yet.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const currentJobId = job.job_id || job.id || job.jobId || job._id;
                return (
                  <div key={currentJobId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.location} • {job.job_type}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/recruiter/applications/${currentJobId}`)}
                      className="rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      View Applications
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}