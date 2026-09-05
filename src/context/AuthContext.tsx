import React, { createContext, useContext, useEffect, useState } from 'react';
import { Archetype, Profile } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  toggleRestMode: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, username: string, archetype: Archetype) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or auto-create profile
  const fetchOrSyncProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching Supabase profile:', error);
      }

      if (data) {
        setProfile(data as Profile);
        return;
      }

      // Profile does not exist yet (create default)
      const username =
        authUser.user_metadata?.display_name ||
        authUser.user_metadata?.username ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        `Scout_${authUser.id.slice(0, 5)}`;

      const archetype: Archetype = (authUser.user_metadata?.archetype as Archetype) || 'Wayfarer';
      const avatarUrl =
        authUser.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

      const { data: newProfile, error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          username,
          archetype,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (!upsertErr && newProfile) {
        setProfile(newProfile as Profile);
      }
    } catch (err) {
      console.error('fetchOrSyncProfile error:', err);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchOrSyncProfile(user);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchOrSyncProfile(session.user).finally(() => setLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchOrSyncProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
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
    if (!profile) return false;
    const newRest = !profile.is_resting;
    await updateProfile({ is_resting: newRest });

    // Log the rest toggle event to caravan_logs if user belongs to a caravan
    if (profile.caravan_id) {
      await supabase.from('caravan_logs').insert({
        caravan_id: profile.caravan_id,
        author_id: profile.id,
        entry_type: 'rest_toggle',
        message: newRest
          ? `has sat down to Rest at the Hearth (Grace Mode active). The party journeys on in peace.`
          : `has stood up refreshed from the Hearth, ready to scout the path forward!`,
      });
    }

    return newRest;
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (error) {
      // Map to friendly human readable messages
      let friendlyMessage = error.message;
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        friendlyMessage = 'Incorrect email or password. Please verify and try again.';
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        friendlyMessage = 'Please confirm your email address before signing in.';
      }
      return { error: new Error(friendlyMessage) };
    }

    return { error: null };
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    username: string,
    archetype: Archetype
  ) => {
    const cleanEmail = email.trim();
    const cleanName = username.trim() || cleanEmail.split('@')[0];
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: {
          display_name: cleanName,
          username: cleanName,
          archetype,
          avatar_url: avatarUrl,
        },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data.user) {
      // Ensure profile row exists immediately
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: cleanName,
        archetype,
        avatar_url: avatarUrl,
      });

      // If session wasn't auto-established, attempt instant sign in
      if (!data.session) {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        updateProfile,
        toggleRestMode,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
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
