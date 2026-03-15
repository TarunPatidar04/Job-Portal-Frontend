
export interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get("content-type");
  const body = contentType?.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const error = (body as ApiErrorResponse) || {};
    throw new Error(
      error.message || "Something went wrong. Please try again.",
    );
  }

  return body;
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "jobseeker" | "recruiter";
  bio?: string;
  resumeFile?: File;
}) {
  const form = new FormData();
  form.append("name", data.name);
  form.append("email", data.email);
  form.append("password", data.password);
  form.append("phoneNumber", data.phoneNumber);
  form.append("role", data.role);

  if (data.bio) {
    form.append("bio", data.bio);
  }

  if (data.resumeFile) {
    form.append("file", data.resumeFile);
  }

  const res = await fetch("/api/auth/register", {
    method: "POST",
    body: form,
  });

  return handleResponse(res);
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
  });

  return handleResponse(res);
}

export async function getMyProfile() {
  const res = await fetch("/api/user/me", {
    headers: {
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function updateProfile(payload: {
  name?: string;
  phoneNumber?: string;
  bio?: string;
}) {
  const res = await fetch("/api/user/update/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateProfilePic(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/user/update/pic", {
    method: "PUT",
    headers: {
      ...authHeaders(),
    },
    body: form,
  });
  return handleResponse(res);
}

export async function updateResume(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/user/update/resume", {
    method: "PUT",
    headers: {
      ...authHeaders(),
    },
    body: form,
  });
  return handleResponse(res);
}

export async function getJobs({
  title,
  location,
}: {
  title?: string;
  location?: string;
} = {}) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (location) params.set("location", location);

  const res = await fetch(`/api/job/all?${params.toString()}`);
  return handleResponse(res);
}

export async function getJob(jobId: string) {
  const res = await fetch(`/api/job/${jobId}`);
  return handleResponse(res);
}

export async function applyForJob(jobId: string) {
  const res = await fetch("/api/user/apply/job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ job_id: jobId }),
  });
  return handleResponse(res);
}

export async function getMyApplications() {
  const res = await fetch("/api/user/application/all", {
    headers: {
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function generateCareerPath(skills: string) {
  const res = await fetch("/api/utils/career", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ skills }),
  });
  return handleResponse(res);
}

export async function analyzeResume(pdfBase64: string) {
  const res = await fetch("/api/utils/resume-analyser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ pdfBase64 }),
  });
  return handleResponse(res);
}

export async function getMyCompanies() {
  const res = await fetch("/api/job/company/all", {
    headers: {
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function createCompany(data: {
  name: string;
  description: string;
  website: string;
  logoFile: File;
}) {
  const form = new FormData();
  form.append("name", data.name);
  form.append("description", data.description);
  form.append("website", data.website);
  form.append("file", data.logoFile);

  const res = await fetch("/api/job/company/new", {
    method: "POST",
    body: form,
    headers: {
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function getCompanyDetails(companyId: string) {
  const res = await fetch(`/api/job/company/${companyId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function createJob(payload: {
  title: string;
  description: string;
  salary: string;
  location: string;
  role: string;
  job_type: string;
  work_location: string;
  company_id: string;
  openings: string;
}) {
  const res = await fetch("/api/job/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getJobApplications(jobId: string) {
  const res = await fetch(`/api/job/application/${jobId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
) {
  const res = await fetch(`/api/job/application/update/${applicationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse(res);
}
