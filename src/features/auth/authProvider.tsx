
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Profile } from "./types/profile";
import { getMyProfile } from "./profileService";

import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

useEffect(() => {
  // Listen for changes to the user's authentication state.
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const user = session?.user ?? null;

  useEffect(() => {
  async function loadProfile() {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const profileData = await getMyProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Could not load profile:", error);
      setProfile(null);
    }
  }

  loadProfile();
}, [user]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
