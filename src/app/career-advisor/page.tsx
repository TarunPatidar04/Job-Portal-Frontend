"use client";

import { useState } from "react";
import { generateCareerPath } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CareerData {
  summary: string;
  jobOptions: Array<{
    title: string;
    responsibilities: string;
    why: string;
  }>;
  skillsToLearn: Array<{
    category: string;
    skills: Array<{
      title: string;
      why: string;
      how: string;
    }>;
  }>;
  learningApproach: {
    title: string;
    points: string[];
  };
}

export default function CareerAdvisorPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!skills.trim()) {
      setError("Please enter your skills");
      return;
    }

    setLoading(true);
    setError(null);
    setCareerData(null);

    try {
      const response = await generateCareerPath(skills);
      setCareerData(response.data);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to generate career path");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-700">
        Please log in to access the career advisor.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Career Advisor</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get personalized career guidance based on your skills. Our AI will suggest job roles,
          learning paths, and career development strategies.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Your Skills
            </label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. JavaScript, React, Node.js, Python, SQL, Git, Docker, AWS..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-300 transition-all min-h-[120px] resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              List your technical skills, programming languages, frameworks, tools, and technologies you know.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing Your Skills...
                </span>
              ) : (
                "🎯 Generate Career Path"
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-700 font-medium text-lg">{error}</p>
        </div>
      )}

      {careerData && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Summary</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{careerData.summary}</p>
          </div>

          {/* Job Options */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Job Roles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {careerData.jobOptions.map((job, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Responsibilities:</h4>
                      <p className="text-gray-600 text-sm">{job.responsibilities}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Why this role fits you:</h4>
                      <p className="text-gray-600 text-sm">{job.why}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills Development Roadmap</h2>
            <div className="space-y-6">
              {careerData.skillsToLearn.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{skill.title}</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Why learn:</span>
                            <p className="text-gray-600 text-sm mt-1">{skill.why}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">How to learn:</span>
                            <p className="text-gray-600 text-sm mt-1">{skill.how}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Approach */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{careerData.learningApproach.title}</h2>
            <ul className="space-y-3">
              {careerData.learningApproach.points.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}