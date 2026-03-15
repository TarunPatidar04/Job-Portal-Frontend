"use client";

import { useEffect, useState } from "react";
import { updateProfile, updateProfilePic, updateResume } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhoneNumber(user.phone_number ?? "");
    setBio(user.bio ?? "");
  }, [user]);

  const handleUpdate = async () => {
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await updateProfile({ name, phoneNumber, bio });
      setMessage("Profile updated successfully.");
      await refreshUser();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await updateResume(resumeFile);
      await refreshUser();
      setMessage("Resume updated successfully.");
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update resume");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!profilePic) return;
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await updateProfilePic(profilePic);
      await refreshUser();
      setMessage("Profile picture updated successfully.");
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
          <p className="mt-2 text-slate-600">
            Update your details or upload your resume.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            disabled={loading}
            onClick={handleUpdate}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
          {user.role === "jobseeker" ? (
            <>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setResumeFile(file ?? null);
                }}
                className="text-sm"
              />
              <button
                disabled={loading || !resumeFile}
                onClick={handleUploadResume}
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {loading ? "Uploading..." : "Upload Resume"}
              </button>
            </>
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setProfilePic(file ?? null);
            }}
            className="text-sm"
          />
          <button
            disabled={loading || !profilePic}
            onClick={handleUploadProfilePic}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {loading ? "Uploading..." : "Upload Profile Picture"}
          </button>
        </div>

        {message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-6">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 mb-6">
            {error}
          </div>
        ) : null}

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="font-medium text-slate-700">Email</p>
              <p className="text-slate-600">{user.email}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Role</p>
              <p className="text-slate-600 capitalize">{user.role}</p>
            </div>
            {user.resume ? (
              <div className="md:col-span-2">
                <p className="font-medium text-slate-700">Resume</p>
                <a
                  href={user.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-slate-900 underline"
                >
                  View Resume
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {user.skills && user.skills.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
