import { Archetype, ArchetypeDetails, QuestCategory } from '../types';

export const ARCHETYPES: Record<Archetype, ArchetypeDetails> = {
  Wayfarer: {
    title: 'Wayfarer',
    subtitle: 'The Scout & Pathfinder',
    description: 'Blazes the trail through uncharted lands. Every completed habit propels the caravan further along the expedition path.',
    icon: 'Compass',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    accentBorder: 'border-sky-500/30 hover:border-sky-400',
    passiveBonus: '+25% Expedition Distance from completed quests',
  },
  Warden: {
    title: 'Warden',
    subtitle: 'The Shield of the Hearth',
    description: 'Tends the sacred embers and guards companions during sleep. Slows natural campfire decay and shields resting members.',
    icon: 'Shield',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accentBorder: 'border-emerald-500/30 hover:border-emerald-400',
    passiveBonus: '-50% Nightly Campfire Decay for the entire party',
  },
  Sage: {
    title: 'Sage',
    subtitle: 'The Seeker of Wisdom',
    description: 'Weaves reflection and deep insight into the journey. Enriches intellect habits and deepens the warmth of kindling sparks.',
    icon: 'BookOpen',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    accentBorder: 'border-indigo-500/30 hover:border-indigo-400',
    passiveBonus: '+10 Bonus XP on Intellect and Clarity rituals',
  },
  Artisan: {
    title: 'Artisan',
    subtitle: 'The Master Builder',
    description: 'Shapes raw effort into enduring craft. Supplies the caravan with seasoned firewood and tools of creation.',
    icon: 'Hammer',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accentBorder: 'border-amber-500/30 hover:border-amber-400',
    passiveBonus: '+5% Extra Campfire Fuel on Craft rituals',
  },
};

export const CATEGORY_STYLES: Record<
  QuestCategory,
  {
    label: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
    badge: string;
    icon: string;
  }
> = {
  Intellect: {
    label: 'Intellect',
    border: 'border-blue-500/20',
    bg: 'bg-blue-950/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/10',
    badge: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
    icon: 'BookOpen',
  },
  Vitality: {
    label: 'Vitality',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
    badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    icon: 'Activity',
  },
  Clarity: {
    label: 'Clarity',
    border: 'border-purple-500/20',
    bg: 'bg-purple-950/20',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/10',
    badge: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
    icon: 'Sparkles',
  },
  Craft: {
    label: 'Craft',
    border: 'border-amber-500/20',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10',
    badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    icon: 'Hammer',
  },
};

export const EXPEDITION_MILESTONES = [
  { distance: 0, name: 'The Lowland Clearing', desc: 'Where the journey begins under quiet pines' },
  { distance: 60, name: 'The Whispering Glade', desc: 'Ancient cedar woods humming with cool winds' },
  { distance: 150, name: 'Starlight Ridge', desc: 'A crystalline summit where constellations guide the way' },
  { distance: 280, name: 'Amber Canyon', desc: 'Sunlit sandstone gorges echoing with companion songs' },
  { distance: 450, name: 'Hearth Mountain Sanctuary', desc: 'The perpetual bonfire overlooking the vast horizon' },
];
