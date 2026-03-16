"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown')) {
          setIsProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">JP</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">JobPortal</span>
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
              
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">{user.name}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <button
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await logout();
                        router.push("/");
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
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
