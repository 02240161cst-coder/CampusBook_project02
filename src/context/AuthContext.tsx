import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { backend } from '../backend';
import { AuthUser, UserProfile } from '../types';

interface AuthState {
  /** true until the first auth state is known (Splash stays visible) */
  loading: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (i: { fullName: string; studentId: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // While registering, ignore the intermediate "signed in" event so the app only
  // opens Home after the profile document has been saved (same as Project I).
  const registering = useRef(false);

  useEffect(() => {
    const unsub = backend.auth.onAuthChange(async (u) => {
      if (registering.current) return;
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
    async signIn(email, password) {
      await backend.auth.signIn(email, password); // onAuthChange takes it from here
    },
    async register(input) {
      registering.current = true;
      try {
        const res = await backend.auth.register(input);
        setProfile(res.profile);
        setUser(res.user);
      } finally {
        registering.current = false;
      }
    },
    async signOut() {
      await backend.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
