export type Archetype = 'Wayfarer' | 'Warden' | 'Sage' | 'Artisan';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  archetype: Archetype;
  level: number;
  total_xp: number;
  streak_days: number;
  is_resting: boolean;
  caravan_id: string | null;
  created_at: string;
}

export interface Caravan {
  id: string;
  name: string;
  motto: string | null;
  invite_code: string;
  campfire_level: number; // 0 to 100
  expedition_distance: number;
  created_by?: string | null;
  created_at: string;
}

export type QuestCategory = 'Intellect' | 'Vitality' | 'Clarity' | 'Craft';

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  category: QuestCategory;
  xp_value: number;
  campfire_value: number;
  is_completed: boolean;
  target_date: string;
  completed_at: string | null;
}

export type CaravanLogEntryType = 'quest_done' | 'kindle_buff' | 'chronicle_story' | 'rest_toggle';

export interface CaravanLog {
  id: string;
  caravan_id: string;
  author_id: string | null;
  author_name?: string;
  author_avatar?: string | null;
  author_archetype?: Archetype;
  entry_type: CaravanLogEntryType;
  message: string;
  created_at: string;
}

export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export interface ArchetypeDetails {
  title: Archetype;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  badgeBg: string;
  accentBorder: string;
  passiveBonus: string;
}
