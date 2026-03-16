"use client";

import { useState, useRef } from "react";
import { analyzeResume } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Suggestion {
  title: string;
  description: string;
}

interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[] | Suggestion[];
  keywords: string[];
  overallFeedback: string;
}

export default function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (data:application/pdf;base64,)
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await analyzeResume(base64);
      setAnalysis(response.data);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-700">
        Please log in to access the resume analyzer.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Resume Analyzer</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get detailed feedback on your resume with ATS scoring, keyword analysis,
          and personalized improvement suggestions.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Upload Your Resume
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="space-y-4">
                  <div className="text-green-600 text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-gray-400 text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">Drop your resume here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    Select PDF File
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Supported format: PDF (max 5MB)
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing Resume...
                </span>
              ) : (
                "🔍 Analyze Resume"
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

      {analysis && (
        <div className="space-y-8">
          {/* ATS Score */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(analysis.atsScore)} mb-6`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                  {analysis.atsScore}
                </div>
                <div className="text-sm font-medium text-gray-600">ATS Score</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Analysis Complete</h2>
            <p className="text-gray-600">{analysis.overallFeedback}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Strengths */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Strengths
              </h3>
              <ul className="space-y-3">
                {analysis?.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No strengths identified</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {analysis?.weaknesses && analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No areas for improvement identified</li>
                )}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-600">💡</span>
              Improvement Suggestions
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {analysis?.suggestions && analysis.suggestions.length > 0 ? (
                analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      {typeof suggestion === 'string' ? suggestion : suggestion.title}
                    </h4>
                    <p className="text-blue-800 text-sm">
                      {typeof suggestion === 'string' ? suggestion : suggestion.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-gray-500 text-center py-8">No suggestions available</div>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-purple-600">🔍</span>
              Key Skills & Keywords Found
            </h3>
            <div className="flex flex-wrap gap-3">
              {analysis?.keywords && analysis.keywords.length > 0 ? (
                analysis.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">No keywords detected</div>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              These keywords were detected in your resume. Make sure they align with the job descriptions youre targeting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}