"use client";

import { useState } from "react";

export function JobSearchForm({
  onSearch,
}: {
  onSearch: (filters: { title?: string; location?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch({ title: title.trim(), location: location.trim() });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col lg:flex-row gap-6"
    >
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Job Title or Keywords
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. React Developer, Software Engineer, Designer"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-300 transition-all placeholder:text-gray-400 text-gray-900"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Location
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Remote, Delhi, Mumbai, Bangalore"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-300 transition-all placeholder:text-gray-400 text-gray-900"
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full lg:w-auto rounded-xl bg-black px-8 py-3.5 text-base font-semibold text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 transition-all shadow-sm hover:shadow-md"
        >
          🔍 Search Jobs
        </button>
      </div>
    </form>
  );
}
