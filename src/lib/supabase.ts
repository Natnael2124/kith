import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Caravan, CaravanLog, Profile, Quest } from '../types';

const STORAGE_KEY_URL = 'kith_supabase_url';
const STORAGE_KEY_ANON = 'kith_supabase_anon_key';

// Read from env or localStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || envUrl;
  const anonKey = localStorage.getItem(STORAGE_KEY_ANON) || envAnon;
  const isConfigured = Boolean(url && anonKey && url.startsWith('http'));
  return { url, anonKey, isConfigured };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  window.location.reload(); // Reload to re-initialize supabase instance
}

export function clearStoredSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  window.location.reload();
}

const config = getStoredSupabaseConfig();

export const supabase: SupabaseClient | null = config.isConfigured
  ? createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ==============================================================================
// DEMO / SANDBOX MOCK STORE (For offline / keyless live exploration)
// ==============================================================================
const INITIAL_CARAVAN_ID = 'caravan-solstice-001';
const CURRENT_DEMO_USER_ID = 'user-wayfarer-001';

const DEFAULT_DEMO_PROFILES: Profile[] = [
  {
    id: CURRENT_DEMO_USER_ID,
    username: 'Lyra Hearthwatcher',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    archetype: 'Wayfarer',
    level: 4,
    total_xp: 780,
    streak_days: 6,
    is_resting: false,
    caravan_id: INITIAL_CARAVAN_ID,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'user-warden-002',
    username: 'Bram Ironpine',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    archetype: 'Warden',
    level: 5,
    total_xp: 940,
    streak_days: 12,
    is_resting: false,
    caravan_id: INITIAL_CARAVAN_ID,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'user-sage-003',
    username: 'Aurelia Sol',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    archetype: 'Sage',
    level: 3,
    total_xp: 520,
    streak_days: 4,
    is_resting: true, // Resting at the Hearth
    caravan_id: INITIAL_CARAVAN_ID,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'user-artisan-004',
    username: 'Kael Weaver',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    archetype: 'Artisan',
    level: 4,
    total_xp: 690,
    streak_days: 8,
    is_resting: false,
    caravan_id: INITIAL_CARAVAN_ID,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

const DEFAULT_DEMO_CARAVAN: Caravan = {
  id: INITIAL_CARAVAN_ID,
  name: 'The Solstice Pilgrims',
  motto: 'Together through deep snows, our embers never die.',
  invite_code: 'SOLSTICE-77',
  campfire_level: 78,
  expedition_distance: 142,
  created_by: CURRENT_DEMO_USER_ID,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
};

const DEFAULT_DEMO_QUESTS: Quest[] = [
  {
    id: 'quest-01',
    user_id: CURRENT_DEMO_USER_ID,
    title: 'Morning 20-minute movement & fresh air',
    category: 'Vitality',
    xp_value: 25,
    campfire_value: 15,
    is_completed: true,
    target_date: new Date().toISOString().split('T')[0],
    completed_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'quest-02',
    user_id: CURRENT_DEMO_USER_ID,
    title: 'Deep focus study / reading 1 chapter',
    category: 'Intellect',
    xp_value: 30,
    campfire_value: 20,
    is_completed: false,
    target_date: new Date().toISOString().split('T')[0],
    completed_at: null,
  },
  {
    id: 'quest-03',
    user_id: CURRENT_DEMO_USER_ID,
    title: '10 minutes of quiet breathing & gratitude',
    category: 'Clarity',
    xp_value: 20,
    campfire_value: 15,
    is_completed: false,
    target_date: new Date().toISOString().split('T')[0],
    completed_at: null,
  },
  {
    id: 'quest-04',
    user_id: CURRENT_DEMO_USER_ID,
    title: 'Work on creative project / code craft',
    category: 'Craft',
    xp_value: 35,
    campfire_value: 20,
    is_completed: false,
    target_date: new Date().toISOString().split('T')[0],
    completed_at: null,
  },
];

const DEFAULT_DEMO_LOGS: CaravanLog[] = [
  {
    id: 'log-01',
    caravan_id: INITIAL_CARAVAN_ID,
    author_id: CURRENT_DEMO_USER_ID,
    author_name: 'Lyra Hearthwatcher',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    author_archetype: 'Wayfarer',
    entry_type: 'quest_done',
    message: 'gathered dry cedar twigs by completing "Morning 20-minute movement & fresh air" (+15% Fire)',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'log-02',
    caravan_id: INITIAL_CARAVAN_ID,
    author_id: 'user-warden-002',
    author_name: 'Bram Ironpine',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    author_archetype: 'Warden',
    entry_type: 'kindle_buff',
    message: 'kindled Aurelia Sol with a cup of hot spiced pine tea: "Rest easy by the hearth. We have the watch."',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'log-03',
    caravan_id: INITIAL_CARAVAN_ID,
    author_id: 'user-sage-003',
    author_name: 'Aurelia Sol',
    author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    author_archetype: 'Sage',
    entry_type: 'rest_toggle',
    message: 'entered Grace Mode ("Rest at the Hearth") to recover strength. Party decay halted.',
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: 'log-04',
    caravan_id: INITIAL_CARAVAN_ID,
    author_id: null,
    author_name: 'The Chronicler',
    entry_type: 'chronicle_story',
    message: 'The Caravan crossed the Whispering Pines pass as twilight painted the ridgeline in violet. Together, 142 leagues behind them, the fire warmed their weary hands.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

class LocalSandboxStore {
  private caravan: Caravan;
  private profiles: Profile[];
  private quests: Quest[];
  private logs: CaravanLog[];
  private currentUserId: string = CURRENT_DEMO_USER_ID;
  private listeners: Array<() => void> = [];

  constructor() {
    const savedCaravan = localStorage.getItem('kith_demo_caravan');
    const savedProfiles = localStorage.getItem('kith_demo_profiles');
    const savedQuests = localStorage.getItem('kith_demo_quests');
    const savedLogs = localStorage.getItem('kith_demo_logs');
    const savedUser = localStorage.getItem('kith_demo_current_user');

    this.caravan = savedCaravan ? JSON.parse(savedCaravan) : DEFAULT_DEMO_CARAVAN;
    this.profiles = savedProfiles ? JSON.parse(savedProfiles) : DEFAULT_DEMO_PROFILES;
    this.quests = savedQuests ? JSON.parse(savedQuests) : DEFAULT_DEMO_QUESTS;
    this.logs = savedLogs ? JSON.parse(savedLogs) : DEFAULT_DEMO_LOGS;
    this.currentUserId = savedUser || CURRENT_DEMO_USER_ID;
  }

  private persist() {
    localStorage.setItem('kith_demo_caravan', JSON.stringify(this.caravan));
    localStorage.setItem('kith_demo_profiles', JSON.stringify(this.profiles));
    localStorage.setItem('kith_demo_quests', JSON.stringify(this.quests));
    localStorage.setItem('kith_demo_logs', JSON.stringify(this.logs));
    localStorage.setItem('kith_demo_current_user', this.currentUserId);
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== listener);
    };
  }

  public getCurrentUser(): Profile {
    return this.profiles.find((p) => p.id === this.currentUserId) || this.profiles[0];
  }

  public setCurrentUserId(id: string) {
    this.currentUserId = id;
    this.persist();
  }

  public getCaravan(): Caravan {
    return this.caravan;
  }

  public getProfiles(): Profile[] {
    return this.profiles;
  }

  public getQuests(): Quest[] {
    return this.quests.filter((q) => q.user_id === this.currentUserId);
  }

  public getAllQuests(): Quest[] {
    return this.quests;
  }

  public getLogs(): CaravanLog[] {
    return [...this.logs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public updateProfile(updates: Partial<Profile>) {
    this.profiles = this.profiles.map((p) =>
      p.id === this.currentUserId ? { ...p, ...updates } : p
    );
    this.persist();
  }

  public toggleRestMode(): boolean {
    const user = this.getCurrentUser();
    const newRest = !user.is_resting;
    this.updateProfile({ is_resting: newRest });

    this.addLog({
      entry_type: 'rest_toggle',
      message: newRest
        ? `has sat down to Rest at the Hearth (Grace Mode active). The party journeys on in peace.`
        : `has stood up refreshed from the Hearth, ready to scout the path forward!`,
    });

    return newRest;
  }

  public completeQuest(questId: string) {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || quest.is_completed) return;

    quest.is_completed = true;
    quest.completed_at = new Date().toISOString();

    // Reward campfire & distance
    const addedFire = quest.campfire_value;
    const addedDistance = Math.floor(quest.xp_value / 5);
    this.caravan.campfire_level = Math.min(100, this.caravan.campfire_level + addedFire);
    this.caravan.expedition_distance += addedDistance;

    // Reward player XP and level
    const user = this.getCurrentUser();
    const newXp = user.total_xp + quest.xp_value;
    const newLevel = Math.floor(newXp / 200) + 1;

    this.updateProfile({
      total_xp: newXp,
      level: newLevel,
    });

    this.addLog({
      entry_type: 'quest_done',
      message: `fed the campfire seasoned birch (+${addedFire}% fire, +${addedDistance} leagues) with: "${quest.title}"`,
    });

    this.persist();
  }

  public uncompleteQuest(questId: string) {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || !quest.is_completed) return;

    quest.is_completed = false;
    quest.completed_at = null;

    const user = this.getCurrentUser();
    const newXp = Math.max(0, user.total_xp - quest.xp_value);
    const newLevel = Math.floor(newXp / 200) + 1;

    this.updateProfile({
      total_xp: newXp,
      level: newLevel,
    });

    this.persist();
  }

  public createQuest(
    data: Omit<Quest, 'id' | 'user_id' | 'is_completed' | 'completed_at' | 'target_date'> & {
      target_date?: string;
    }
  ) {
    const newQuest: Quest = {
      id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: this.currentUserId,
      title: data.title,
      category: data.category,
      xp_value: data.xp_value || 25,
      campfire_value: data.campfire_value || 15,
      is_completed: false,
      target_date: data.target_date || new Date().toISOString().split('T')[0],
      completed_at: null,
    };
    this.quests = [newQuest, ...this.quests];
    this.persist();
    return newQuest;
  }

  public deleteQuest(questId: string) {
    this.quests = this.quests.filter((q) => q.id !== questId);
    this.persist();
  }

  public kindleCompanion(targetProfileId: string, note?: string) {
    const target = this.profiles.find((p) => p.id === targetProfileId);
    if (!target) return;

    // Kindling boosts campfire
    const fireBoost = 10;
    this.caravan.campfire_level = Math.min(100, this.caravan.campfire_level + fireBoost);

    const message = note
      ? `kindled ${target.username} with warmth: "${note}" (+${fireBoost}% Campfire)`
      : `kindled ${target.username} with a warm ember of encouragement (+${fireBoost}% Campfire)`;

    this.addLog({
      entry_type: 'kindle_buff',
      message,
    });

    this.persist();
  }

  public addLog(entry: {
    entry_type: CaravanLog['entry_type'];
    message: string;
    author_id?: string | null;
  }) {
    const actor = this.getCurrentUser();
    const authorId = entry.author_id !== undefined ? entry.author_id : actor.id;
    const author = authorId ? this.profiles.find((p) => p.id === authorId) : null;

    const newLog: CaravanLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      caravan_id: this.caravan.id,
      author_id: authorId,
      author_name: author ? author.username : 'The Chronicler',
      author_avatar: author ? author.avatar_url : null,
      author_archetype: author ? author.archetype : undefined,
      entry_type: entry.entry_type,
      message: entry.message,
      created_at: new Date().toISOString(),
    };

    this.logs = [newLog, ...this.logs].slice(0, 100);
    this.persist();
    return newLog;
  }

  public updateCaravan(updates: Partial<Caravan>) {
    this.caravan = { ...this.caravan, ...updates };
    this.persist();
  }

  public joinCaravan(code: string, name: string) {
    this.caravan = {
      ...this.caravan,
      id: `caravan-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: name || 'The Resolute Caravan',
      invite_code: code.toUpperCase(),
      campfire_level: 85,
    };
    this.persist();
  }

  public resetDemoData() {
    localStorage.removeItem('kith_demo_caravan');
    localStorage.removeItem('kith_demo_profiles');
    localStorage.removeItem('kith_demo_quests');
    localStorage.removeItem('kith_demo_logs');
    localStorage.removeItem('kith_demo_current_user');
    this.caravan = DEFAULT_DEMO_CARAVAN;
    this.profiles = DEFAULT_DEMO_PROFILES;
    this.quests = DEFAULT_DEMO_QUESTS;
    this.logs = DEFAULT_DEMO_LOGS;
    this.currentUserId = CURRENT_DEMO_USER_ID;
    this.persist();
  }
}

export const sandboxStore = new LocalSandboxStore();
