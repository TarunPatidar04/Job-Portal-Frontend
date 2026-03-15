"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          JobPortal
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            Jobs
          </Link>
          {user ? (
            <>
              {user?.role?.toLowerCase() === "jobseeker" && (
                <Link
                  href="/applications"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  My Applications
                </Link>
              )}
              {user?.role?.toLowerCase() === "recruiter" && (
                <Link
                  href="/recruiter/dashboard"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/career-advisor"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Career Advisor
              </Link>
              <Link
                href="/resume-analyzer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Resume Analyzer
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
