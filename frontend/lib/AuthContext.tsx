import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, supabaseConfigured } from './supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, specialty: string, institution: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    if (!supabaseConfigured) {
      setUser({ id: 'demo', email: 'demo@demo.com' } as any);
      setLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          void fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      });
      subscription = data.subscription;
    } catch (e) {
      console.error('[supabase-auth] onAuthStateChange failed', e);
    }

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        const session = data.session ?? null;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) void fetchProfile(session.user.id);
      })
      .catch((e: unknown) => {
        console.error('[supabase-auth] getSession failed', e);
        setSession(null);
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const ensureProfileRow = async (
    userId: string,
    email: string,
    fullName: string,
    specialty: string,
    institution: string,
    avatarInitials: string,
  ) => {
    const row = {
      id: userId,
      email,
      full_name: fullName,
      specialty,
      institution,
      avatar_initials: avatarInitials,
    };
    // Upsert avoids races; RLS requires auth.uid() = id (session must be set)
    const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
    return error ?? null;
  };

  const signUp = async (email: string, password: string, fullName: string, specialty: string, institution: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_initials: getInitials(fullName),
        },
      },
    });

    if (error) return { error: error as Error | null };

    const newUser = data?.user;
    const newSession = data?.session;
    const initials = getInitials(fullName);
    if (!newUser) return { error: null };

    // Email confirmation enabled: Supabase returns user but no session until the user verifies email.
    // RLS on profiles requires auth.uid() = id, so we cannot insert until they have a session.
    // Profile row is created on first signIn (see signIn below).
    if (!newSession) {
      return { error: null };
    }

    await supabase.auth.setSession({
      access_token: newSession.access_token,
      refresh_token: newSession.refresh_token,
    });

    let profileError: Error | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      profileError = await ensureProfileRow(newUser.id, email, fullName, specialty, institution, initials);
      if (!profileError) break;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }

    if (profileError) {
      return { error: new Error('Account created but failed to save profile: ' + profileError.message) };
    }

    await fetchProfile(newUser.id);
    setSession(newSession);
    setUser(newUser);

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error as Error | null };

    if (data?.user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const name = data.user.user_metadata?.full_name || email.split('@')[0];
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        await ensureProfileRow(data.user.id, email, name, '', '', initials);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) await fetchProfile(user.id);
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
