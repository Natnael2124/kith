import React, { createContext, useContext, useEffect, useState } from 'react';
import { Archetype, Profile } from '../types';
import { sandboxStore, supabase } from '../lib/supabase';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  isSandbox: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  toggleRestMode: () => Promise<boolean>;
  switchSandboxUser: (userId: string) => void;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, username: string, archetype: Archetype) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isSandbox = !supabase;

  // Load profile
  const fetchSupabaseProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('Error fetching Supabase profile:', error);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Fetch profile err:', err);
    }
  };

  useEffect(() => {
    if (isSandbox) {
      // Sandbox mode
      setProfile(sandboxStore.getCurrentUser());
      const unsub = sandboxStore.subscribe(() => {
        setProfile(sandboxStore.getCurrentUser());
      });
      setLoading(false);
      return unsub;
    }

    // Live Supabase Mode
    const initAuth = async () => {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchSupabaseProfile(session.user.id);
      }
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchSupabaseProfile(session.user.id);
        } else {
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initAuth();
  }, [isSandbox]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (isSandbox) {
      sandboxStore.updateProfile(updates);
      setProfile(sandboxStore.getCurrentUser());
      return;
    }

    if (!supabase || !profile) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    if (data) setProfile(data as Profile);
  };

  const toggleRestMode = async (): Promise<boolean> => {
    if (isSandbox) {
      const newRest = sandboxStore.toggleRestMode();
      setProfile(sandboxStore.getCurrentUser());
      return newRest;
    }

    if (!supabase || !profile) return false;
    const newRest = !profile.is_resting;
    await updateProfile({ is_resting: newRest });

    // Log the rest toggle event
    await supabase.from('caravan_logs').insert({
      caravan_id: profile.caravan_id,
      author_id: profile.id,
      entry_type: 'rest_toggle',
      message: newRest
        ? `has sat down to Rest at the Hearth (Grace Mode active). The party journeys on in peace.`
        : `has stood up refreshed from the Hearth, ready to scout the path forward!`,
    });

    return newRest;
  };

  const switchSandboxUser = (userId: string) => {
    if (!isSandbox) return;
    sandboxStore.setCurrentUserId(userId);
    setProfile(sandboxStore.getCurrentUser());
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (isSandbox || !supabase) {
      return { error: new Error('Supabase is not configured. Currently in Sandbox mode.') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    username: string,
    archetype: Archetype
  ) => {
    if (isSandbox || !supabase) {
      return { error: new Error('Supabase is not configured. Currently in Sandbox mode.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          username,
          archetype,
        },
      },
    });

    if (!error && data.user) {
      // Ensure profile row exists
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        archetype,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      });
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        isSandbox,
        updateProfile,
        toggleRestMode,
        switchSandboxUser,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
