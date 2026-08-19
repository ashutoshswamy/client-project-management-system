"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/data";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import type { UserProfile } from "@/lib/types";

const defaultProfile: UserProfile = { displayName: "", currency: DEFAULT_CURRENCY };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  profile: UserProfile;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getUserProfile().then((p) => setProfile(p ?? defaultProfile));
  }, [user]);

  const effectiveProfile = user ? profile : defaultProfile;

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, profile: effectiveProfile, signIn, signOutUser, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
