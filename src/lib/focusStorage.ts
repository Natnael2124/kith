import { FocusSession, Profile } from '../types';
import { supabase } from './supabase';

const LOCAL_SESSIONS_KEY = 'kith_focus_sessions_cache';

export interface RatingTierInfo {
  tier: 'Scout' | 'Pathfinder' | 'Vanguard' | 'Hearthkeeper';
  minRating: number;
  maxRating: number;
  color: string;
  textColor: string;
  badgeBg: string;
  bgBadge: string;
  accentBorder: string;
  description: string;
}

export const RATING_TIERS: Record<string, RatingTierInfo> = {
  Scout: {
    tier: 'Scout',
    minRating: 0,
    maxRating: 1299,
    color: '#94a3b8',
    textColor: 'text-stone-400',
    badgeBg: 'bg-stone-800/80',
    bgBadge: 'bg-stone-800/80',
    accentBorder: 'border-stone-700',
    description: 'Fresh on the trail, learning the sacred disciplines of the hearth.',
  },
  Pathfinder: {
    tier: 'Pathfinder',
    minRating: 1300,
    maxRating: 1499,
    color: '#10b981',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    bgBadge: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
    description: 'Carving reliable routes through the wilderness with steady focus.',
  },
  Vanguard: {
    tier: 'Vanguard',
    minRating: 1500,
    maxRating: 1699,
    color: '#818cf8',
    textColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    bgBadge: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500/30',
    description: 'Vigilant and resolute, defending the caravan expedition with deep craft.',
  },
  Hearthkeeper: {
    tier: 'Hearthkeeper',
    minRating: 1700,
    maxRating: 9999,
    color: '#f59e0b',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    bgBadge: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    description: 'Master of unwavering intentionality, keeper of the eternal flame.',
  },
};

export function getRatingTier(rating: number = 1200): RatingTierInfo {
  if (rating >= 1700) return RATING_TIERS.Hearthkeeper;
  if (rating >= 1500) return RATING_TIERS.Vanguard;
  if (rating >= 1300) return RATING_TIERS.Pathfinder;
  return RATING_TIERS.Scout;
}

// Local cache helpers
function getCachedSessions(userId: string): FocusSession[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_SESSIONS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function setCachedSessions(userId: string, sessions: FocusSession[]) {
  try {
    localStorage.setItem(`${LOCAL_SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

// Fetch sessions for user (Supabase with localStorage fallback)
export async function fetchFocusSessions(userId: string): Promise<FocusSession[]> {
  const cached = getCachedSessions(userId);

  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const remote = data as FocusSession[];
      setCachedSessions(userId, remote);
      return remote;
    }
  } catch (err) {
    console.warn('Could not query public.focus_sessions from Supabase, using local cache:', err);
  }

  return cached;
}

// Record completed focus session and calibrate profile rating
export async function recordFocusSession(
  profile: Profile,
  sessionInput: {
    target: string;
    outcome: string | null;
    durationMinutes: number;
    ratingDelta: number;
    feedback: string;
  }
): Promise<{ session: FocusSession; newRating: number; newPeakRating: number }> {
  const currentRating = profile.rating ?? 1200;
  const currentPeak = profile.peak_rating ?? 1200;
  const newRating = Math.max(100, currentRating + sessionInput.ratingDelta);
  const newPeakRating = Math.max(currentPeak, newRating);

  const newSession: FocusSession = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fs_${Date.now()}`,
    user_id: profile.id,
    target_intent: sessionInput.target,
    actual_outcome: sessionInput.outcome,
    duration_minutes: sessionInput.durationMinutes,
    rating_delta: sessionInput.ratingDelta,
    new_rating: newRating,
    feedback: sessionInput.feedback,
    created_at: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  const existing = getCachedSessions(profile.id);
  const updatedList = [...existing, newSession];
  setCachedSessions(profile.id, updatedList);

  // 2. Persist to Supabase focus_sessions
  try {
    await supabase.from('focus_sessions').insert({
      id: newSession.id,
      user_id: profile.id,
      target_intent: newSession.target_intent,
      actual_outcome: newSession.actual_outcome,
      duration_minutes: newSession.duration_minutes,
      rating_delta: newSession.rating_delta,
      new_rating: newRating,
      feedback: newSession.feedback,
      created_at: newSession.created_at,
    });
  } catch (err) {
    console.warn('Failed to insert into public.focus_sessions (table may need migration):', err);
  }

  // 3. Persist new rating to public.profiles
  try {
    await supabase
      .from('profiles')
      .update({
        rating: newRating,
        peak_rating: newPeakRating,
      })
      .eq('id', profile.id);
  } catch (err) {
    console.warn('Failed to update rating in public.profiles (column may need migration):', err);
  }

  return { session: newSession, newRating, newPeakRating };
}
