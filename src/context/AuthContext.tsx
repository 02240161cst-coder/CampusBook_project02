import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { backend, BackendError } from '../backend';
import { AuthUser, normalizeRole, ProfilePatch, UserProfile, UserType } from '../types';

interface AuthState {
  /** true until the first auth state is known (Splash stays visible) */
  loading: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
  /** Project II: "Student" or "Staff" (old Project I accounts count as Student) */
  role: UserType;
  /** Signs in – fails if the account type does not match the selected Student/Staff login. */
  signIn: (email: string, password: string, role: UserType) => Promise<void>;
  register: (i: {
    fullName: string;
    studentId: string;
    email: string;
    password: string;
    userType: UserType;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  /** Project II: edit name / ID / photo */
  updateProfile: (patch: ProfilePatch) => Promise<void>;
}

const Ctx = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // While registering / checking the role, ignore intermediate auth events so the app
  // only opens Home once the profile is known (same idea as Project I).
  const busy = useRef(false);

  useEffect(() => {
    const unsub = backend.auth.onAuthChange(async (u) => {
      if (busy.current) return;
      if (!u) {
        setProfile(null);
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        setProfile(await backend.users.get(u.uid));
      } catch {
        setProfile(null);
      }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value: AuthState = {
    loading,
    user,
    profile,
    role: normalizeRole(profile?.userType),

    async signIn(email, password, role) {
      busy.current = true;
      try {
        const u = await backend.auth.signIn(email, password);
        let p: UserProfile | null = null;
        try {
          p = await backend.users.get(u.uid);
        } catch {
          p = null;
        }
        const actual = normalizeRole(p?.userType);
        if (actual !== role) {
          await backend.auth.signOut();
          throw new BackendError(
            `This account is registered as ${actual}. Please use the ${actual} login.`,
          );
        }
        setProfile(p);
        setUser(u);
      } finally {
        busy.current = false;
      }
    },

    async register(input) {
      busy.current = true;
      try {
        const res = await backend.auth.register(input);
        setProfile(res.profile);
        setUser(res.user);
      } finally {
        busy.current = false;
      }
    },

    async signOut() {
      await backend.auth.signOut();
    },

    async updateProfile(patch) {
      if (!user) return;
      const updated = await backend.users.update(user.uid, patch);
      setProfile(updated);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
