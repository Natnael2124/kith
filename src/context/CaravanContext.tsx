import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Caravan, CaravanLog, Profile, Quest } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { sound } from '../lib/sound';
import confetti from 'canvas-confetti';

interface CaravanContextType {
  caravan: Caravan | null;
  partyMembers: Profile[];
  quests: Quest[];
  allPartyQuests: Quest[];
  logs: CaravanLog[];
  loading: boolean;
  completeQuest: (questId: string) => Promise<void>;
  uncompleteQuest: (questId: string) => Promise<void>;
  createQuest: (data: Omit<Quest, 'id' | 'user_id' | 'is_completed' | 'completed_at' | 'target_date'> & { target_date?: string }) => Promise<Quest | null>;
  deleteQuest: (questId: string) => Promise<void>;
  kindleCompanion: (targetUserId: string, note?: string) => Promise<void>;
  addCustomLog: (entryType: CaravanLog['entry_type'], message: string) => Promise<void>;
  joinCaravanByCode: (code: string) => Promise<boolean>;
  createCaravan: (name?: string, motto?: string) => Promise<Caravan | null>;
  refreshData: () => Promise<void>;
}

const CaravanContext = createContext<CaravanContextType | undefined>(undefined);

export const CaravanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, refreshProfile } = useAuth();
  const [caravan, setCaravan] = useState<Caravan | null>(null);
  const [partyMembers, setPartyMembers] = useState<Profile[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [allPartyQuests, setAllPartyQuests] = useState<Quest[]>([]);
  const [logs, setLogs] = useState<CaravanLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch full data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    if (!profile) {
      setCaravan(null);
      setPartyMembers([]);
      setQuests([]);
      setAllPartyQuests([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Quests for current user
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', profile.id)
        .order('is_completed', { ascending: true })
        .order('completed_at', { ascending: false });
      if (questsData) setQuests(questsData as Quest[]);

      // 2. Caravan & Party data if user has caravan_id
      if (profile.caravan_id) {
        // Fetch Caravan
        const { data: caravanData } = await supabase
          .from('caravans')
          .select('*')
          .eq('id', profile.caravan_id)
          .single();
        if (caravanData) setCaravan(caravanData as Caravan);

        // Fetch Party Members
        const { data: membersData } = await supabase
          .from('profiles')
          .select('*')
          .eq('caravan_id', profile.caravan_id);
        const members = (membersData as Profile[]) || [];
        setPartyMembers(members);

        // Fetch Caravan Logs
        const { data: logsData } = await supabase
          .from('caravan_logs')
          .select('*')
          .eq('caravan_id', profile.caravan_id)
          .order('created_at', { ascending: false })
          .limit(60);

        if (logsData) {
          const enriched = (logsData as CaravanLog[]).map((log) => {
            const author = members.find((m) => m.id === log.author_id);
            return {
              ...log,
              author_name: author?.username || log.author_name || 'Companion',
              author_avatar: author?.avatar_url || log.author_avatar,
              author_archetype: author?.archetype,
            };
          });
          setLogs(enriched);
        }

        // Fetch all party quests
        if (members.length > 0) {
          const { data: partyQuestsData } = await supabase
            .from('quests')
            .select('*')
            .in('user_id', members.map((m) => m.id));
          if (partyQuestsData) setAllPartyQuests(partyQuestsData as Quest[]);
        }
      } else {
        setCaravan(null);
        setPartyMembers([]);
        setLogs([]);
        setAllPartyQuests([]);
      }
    } catch (err) {
      console.error('Error fetching Supabase caravan data:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchSupabaseData();

    // Setup Supabase Realtime subscriptions
    if (profile?.caravan_id) {
      const channel = supabase
        .channel(`caravan-${profile.caravan_id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'caravans', filter: `id=eq.${profile.caravan_id}` },
          (payload) => {
            if (payload.new) setCaravan(payload.new as Caravan);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'caravan_logs', filter: `caravan_id=eq.${profile.caravan_id}` },
          () => {
            fetchSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles', filter: `caravan_id=eq.${profile.caravan_id}` },
          () => {
            fetchSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'quests' },
          () => {
            fetchSupabaseData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.caravan_id, fetchSupabaseData]);

  // Seed default starter habits for instant gameplay satisfaction
  const seedStarterQuestsIfEmpty = async (userId: string) => {
    const { data: existingQuests } = await supabase
      .from('quests')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!existingQuests || existingQuests.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('quests').insert([
        {
          user_id: userId,
          title: 'Hydrate & nourish with fresh water',
          category: 'Vitality',
          xp_value: 20,
          campfire_value: 15,
          is_completed: false,
          target_date: today,
        },
        {
          user_id: userId,
          title: '30 minutes focused work or deep study',
          category: 'Intellect',
          xp_value: 30,
          campfire_value: 20,
          is_completed: false,
          target_date: today,
        },
        {
          user_id: userId,
          title: '20 minutes movement & fresh air',
          category: 'Vitality',
          xp_value: 25,
          campfire_value: 15,
          is_completed: false,
          target_date: today,
        },
      ]);
    }
  };

  // Complete quest
  const completeQuest = async (questId: string) => {
    sound.playQuestComplete();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#10b981'],
      });
    } catch {
      // ignore
    }

    if (!profile) return;
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    // 1. Mark quest completed
    const { error: questErr } = await supabase
      .from('quests')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', questId);
    if (questErr) throw questErr;

    // 2. Update campfire & expedition distance
    if (caravan) {
      const newFire = Math.min(100, caravan.campfire_level + quest.campfire_value);
      const newDist = caravan.expedition_distance + Math.floor(quest.xp_value / 5);

      await supabase
        .from('caravans')
        .update({ campfire_level: newFire, expedition_distance: newDist })
        .eq('id', caravan.id);
    }

    // 3. Update player XP
    const newXp = profile.total_xp + quest.xp_value;
    const newLevel = Math.floor(newXp / 200) + 1;
    await supabase.from('profiles').update({ total_xp: newXp, level: newLevel }).eq('id', profile.id);

    // 4. Log to Caravan Feed
    if (profile.caravan_id) {
      await supabase.from('caravan_logs').insert({
        caravan_id: profile.caravan_id,
        author_id: profile.id,
        entry_type: 'quest_done',
        message: `fed the campfire seasoned birch (+${quest.campfire_value}% fire, +${Math.floor(
          quest.xp_value / 5
        )} leagues) with: "${quest.title}"`,
      });
    }

    await fetchSupabaseData();
  };

  // Uncomplete quest
  const uncompleteQuest = async (questId: string) => {
    if (!profile) return;
    await supabase
      .from('quests')
      .update({ is_completed: false, completed_at: null })
      .eq('id', questId);

    await fetchSupabaseData();
  };

  // Create quest
  const createQuest = async (
    data: Omit<Quest, 'id' | 'user_id' | 'is_completed' | 'completed_at' | 'target_date'> & {
      target_date?: string;
    }
  ): Promise<Quest | null> => {
    if (!profile) return null;
    const { data: created, error } = await supabase
      .from('quests')
      .insert({
        user_id: profile.id,
        title: data.title,
        category: data.category,
        xp_value: data.xp_value || 25,
        campfire_value: data.campfire_value || 15,
        is_completed: false,
        target_date: data.target_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    await fetchSupabaseData();
    return created as Quest;
  };

  // Delete quest
  const deleteQuest = async (questId: string) => {
    await supabase.from('quests').delete().eq('id', questId);
    await fetchSupabaseData();
  };

  // Kindle a companion
  const kindleCompanion = async (targetUserId: string, note?: string) => {
    sound.playKindleBuff();
    if (!profile || !caravan) return;

    const target = partyMembers.find((m) => m.id === targetUserId);
    if (!target) return;

    // Boost campfire
    const fireBoost = 10;
    const newFire = Math.min(100, caravan.campfire_level + fireBoost);
    await supabase.from('caravans').update({ campfire_level: newFire }).eq('id', caravan.id);

    // Log heartwarming message
    const message = note
      ? `kindled ${target.username} with warmth: "${note}" (+${fireBoost}% Campfire)`
      : `kindled ${target.username} with a warm ember of encouragement (+${fireBoost}% Campfire)`;

    await supabase.from('caravan_logs').insert({
      caravan_id: caravan.id,
      author_id: profile.id,
      entry_type: 'kindle_buff',
      message,
    });

    await fetchSupabaseData();
  };

  // Add custom log (e.g. Chronicle story)
  const addCustomLog = async (entryType: CaravanLog['entry_type'], message: string) => {
    if (!caravan) return;
    await supabase.from('caravan_logs').insert({
      caravan_id: caravan.id,
      author_id: profile?.id || null,
      entry_type: entryType,
      message,
    });
    await fetchSupabaseData();
  };

  // Join Caravan by code
  const joinCaravanByCode = async (code: string): Promise<boolean> => {
    if (!profile) return false;
    const cleanCode = code.trim().toUpperCase();

    const { data: foundCaravan, error: findErr } = await supabase
      .from('caravans')
      .select('*')
      .eq('invite_code', cleanCode)
      .single();

    if (findErr || !foundCaravan) return false;

    // Link user to caravan
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ caravan_id: foundCaravan.id })
      .eq('id', profile.id);

    if (updateErr) throw updateErr;

    // Seed starter habits if user has none
    await seedStarterQuestsIfEmpty(profile.id);

    // Log welcome message
    await supabase.from('caravan_logs').insert({
      caravan_id: foundCaravan.id,
      author_id: profile.id,
      entry_type: 'kindle_buff',
      message: `${profile.username} joined the Caravan! A new bedroll is laid by the fire.`,
    });

    await refreshProfile();
    await fetchSupabaseData();
    return true;
  };

  // Create Caravan
  const createCaravan = async (name?: string, motto?: string): Promise<Caravan | null> => {
    if (!profile) return null;
    const caravanName = name?.trim() || `${profile.username}'s Caravan`;
    const caravanMotto = motto?.trim() || 'Together through deep snows, our embers never die.';
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newCaravan, error } = await supabase
      .from('caravans')
      .insert({
        name: caravanName,
        motto: caravanMotto,
        invite_code: inviteCode,
        campfire_level: 100,
        expedition_distance: 0,
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('profiles')
      .update({ caravan_id: newCaravan.id })
      .eq('id', profile.id);

    // Seed starter habits if user has none
    await seedStarterQuestsIfEmpty(profile.id);

    await supabase.from('caravan_logs').insert({
      caravan_id: newCaravan.id,
      author_id: profile.id,
      entry_type: 'kindle_buff',
      message: `${profile.username} founded "${caravanName}"! The sacred hearth is ignited with pure flame.`,
    });

    await refreshProfile();
    await fetchSupabaseData();
    return newCaravan as Caravan;
  };

  return (
    <CaravanContext.Provider
      value={{
        caravan,
        partyMembers,
        quests,
        allPartyQuests,
        logs,
        loading,
        completeQuest,
        uncompleteQuest,
        createQuest,
        deleteQuest,
        kindleCompanion,
        addCustomLog,
        joinCaravanByCode,
        createCaravan,
        refreshData: fetchSupabaseData,
      }}
    >
      {children}
    </CaravanContext.Provider>
  );
};

export const useCaravan = () => {
  const context = useContext(CaravanContext);
  if (!context) throw new Error('useCaravan must be used within a CaravanProvider');
  return context;
};
