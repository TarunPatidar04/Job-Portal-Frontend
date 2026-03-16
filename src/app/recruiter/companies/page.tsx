"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyCompanies, createCompany } from "@/lib/api";

interface Company {
  company_id?: number;
  id?: number;
  name: string;
  description: string;
  website: string;
  logo_url?: string;
}

export default function RecruiterCompaniesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  const [newCompany, setNewCompany] = useState({ name: "", description: "", website: "" });
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.description || !newCompany.website || !companyLogo) {
      setError("Please fill all fields and upload a logo");
      return;
    }

    setCreating(true);
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
      setShowCreateForm(false);
      
      // Reload companies
      await loadCompanies();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create company");
    } finally {
      setCreating(false);
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
          <h1 className="text-3xl font-bold text-slate-900">My Companies</h1>
          <p className="text-slate-600 mt-1">Manage your company profiles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {showCreateForm ? "Cancel" : "+ Add Company"}
          </button>
          <button
            onClick={() => router.push("/recruiter/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Create Company Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Create New Company</h2>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={newCompany.description}
                onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Enter company description"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
              <input
                type="url"
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Company"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Companies List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-gray-50 p-16 text-center shadow-sm">
          <p className="text-slate-600 text-lg font-medium mb-4">No companies created yet.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Create Your First Company
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div key={company.company_id || company.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{company.name}</h3>
                  <p className="text-sm text-slate-500">{company.website}</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-sm mb-4 line-clamp-3">{company.description}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/recruiter/companies/${company.company_id || company.id}`)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View Details
                </button>
                <button
                  onClick={() => router.push(`/recruiter/dashboard?company=${company.company_id || company.id}`)}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Post Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
