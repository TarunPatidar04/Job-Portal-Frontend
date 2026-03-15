"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "@/lib/api";

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number?: string;
  role: "jobseeker" | "recruiter";
  bio?: string;
  resume?: string;
  profile_pic?: string;
  skills?: string[];
  subscription?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: "jobseeker" | "recruiter";
    bio?: string;
    resumeFile?: File;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = () => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const response = await api.getMyProfile();
      setUser(response.user);
      setToken(storedToken);
    } catch (error) {
      console.error("Failed to refresh user", error);
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (token) {
      void refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.token) {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser(response.user);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: "jobseeker" | "recruiter";
    bio?: string;
    resumeFile?: File;
  }) => {
    const response = await api.register(data);
    if (response.token) {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser(response.user);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
