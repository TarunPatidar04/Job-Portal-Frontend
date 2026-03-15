"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createCompany,
  createJob,
  getCompanyDetails,
  getMyCompanies,
  getJobApplications,
  updateApplicationStatus,
} from "@/lib/api";

interface Company {
  company_id: number;
  name: string;
  description: string;
  website: string;
  logo: string;
}

interface Job {
  job_id: number;
  title: string;
  salary: string;
  location: string;
  role: string;
  job_type: string;
  work_location: string;
  openings: number;
  is_active: boolean;
}

interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email: string;
  status: "Submitted" | "Rejected" | "Hired";
  resume: string;
  applied_at: string;
  subscribed: boolean;
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
    role: "",
    job_type: "",
    work_location: "",
    openings: "1",
  });
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    website: "",
  });
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const isRecruiter = user?.role === "recruiter";

  const resetForm = () => {
    setNewJob({
      title: "",
      description: "",
      salary: "",
      location: "",
      role: "",
      job_type: "",
      work_location: "",
      openings: "1",
    });
  };

  const resetCompanyForm = () => {
    setNewCompany({
      name: "",
      description: "",
      website: "",
    });
    setCompanyLogo(null);
  };

  const handleCreateCompany = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!companyLogo) {
      setError("Company logo is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCompany({
        ...newCompany,
        logoFile: companyLogo,
      });
      await loadCompanies();
      resetCompanyForm();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyCompanies();
      setCompanies(res.companies || []);
      if (res.companies?.length) {
        setSelectedCompanyId(res.companies[0].company_id);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyJobs = async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCompanyDetails(companyId.toString());
      const jobsFromRes = (res.companyData?.jobs ?? []) as Job[];
      setJobs(jobsFromRes);
      setApplications([]);
      setActiveJobId(null);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadJobApplications = async (jobId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobApplications(jobId.toString());
      setApplications(res.applications || []);
      setActiveJobId(jobId);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCompanyId) return;

    setLoading(true);
    setError(null);

    try {
      await createJob({
        ...newJob,
        company_id: selectedCompanyId.toString(),
      });
      await loadCompanyJobs(selectedCompanyId);
      resetForm();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (
    applicationId: number,
    status: "Hired" | "Rejected",
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateApplicationStatus(applicationId.toString(), status);
      if (activeJobId) {
        await loadJobApplications(activeJobId);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isRecruiter) return;
    void loadCompanies();
  }, [isRecruiter]);

  useEffect(() => {
    if (selectedCompanyId) {
      void loadCompanyJobs(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700">
        Please log in to access the recruiter dashboard.
      </div>
    );
  }

  if (!isRecruiter) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Recruiter dashboard is only available for recruiter accounts.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Manage your job postings and view applications.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="col-span-1 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Companies</h2>
          {loading && companies.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Loading companies…</p>
          ) : companies.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No companies found. You can create your first company via the API or seed data.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {companies.map((company) => (
                <button
                  key={company.company_id}
                  onClick={() => setSelectedCompanyId(company.company_id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    selectedCompanyId === company.company_id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{company.name}</span>
                    <span className="text-xs text-slate-500">{company.website}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{company.description}</p>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-md font-semibold text-slate-900">Create a company</h3>
            <form className="mt-4 space-y-4" onSubmit={handleCreateCompany}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <input
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setCompanyLogo(file ?? null);
                  }}
                  className="mt-1 w-full text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={loading}
              >
                Create company
              </button>
            </form>
          </div>
        </section>

        <section className="col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Create Job</h2>
            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateJob}>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Job Title
                </label>
                <input
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Salary</label>
                <input
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <input
                  value={newJob.role}
                  onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Job Type</label>
                <select
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Work Location</label>
                <select
                  value={newJob.work_location}
                  onChange={(e) => setNewJob({ ...newJob, work_location: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">Select work location</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Openings</label>
                <input
                  type="number"
                  min={1}
                  value={newJob.openings}
                  onChange={(e) => setNewJob({ ...newJob, openings: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  disabled={!selectedCompanyId || loading}
                >
                  Create Job
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Jobs</h2>
            {loading && jobs.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Loading jobs…</p>
            ) : jobs.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No jobs found. Create one using the form above.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.job_id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {job.location} • ₹{parseFloat(job.salary)?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">Openings: {job.openings}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadJobApplications(job.job_id)}
                          className="rounded-lg border border-indigo-500 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          View applications
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeJobId && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Applications
              </h2>
              {loading && applications.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Loading applications…</p>
              ) : applications.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No applications have been submitted for this job yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.application_id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {app.applicant_email}
                          </p>
                          <p className="text-xs text-slate-500">
                            Applied on {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                          {app.subscribed && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                              Priority applicant
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              app.status === "Hired"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.status === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {app.status}
                          </span>
                          <button
                            onClick={() => handleUpdateApplication(app.application_id, "Hired")}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            disabled={app.status === "Hired"}
                          >
                            Mark Hired
                          </button>
                          <button
                            onClick={() => handleUpdateApplication(app.application_id, "Rejected")}
                            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                            disabled={app.status === "Rejected"}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
