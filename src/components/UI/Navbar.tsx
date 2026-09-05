import React from 'react';
import {
  Flame,
  Moon,
  Sun,
  Settings,
  CheckCircle2,
  BookOpen,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCaravan } from '../../context/CaravanContext';
import { ARCHETYPES } from '../../lib/constants';

interface NavbarProps {
  activeTab: 'hearth' | 'quests' | 'logs';
  onSelectTab: (tab: 'hearth' | 'quests' | 'logs') => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { profile, toggleRestMode, isSandbox, signOut } = useAuth();
  const { caravan } = useCaravan();

  const archetypeInfo = profile ? ARCHETYPES[profile.archetype] : ARCHETYPES.Wayfarer;
  const currentXp = profile?.total_xp || 0;
  const currentLevelBase = ((profile?.level || 1) - 1) * 200;
  const xpInLevel = Math.max(0, currentXp - currentLevelBase);
  const xpPercent = Math.min(100, Math.round((xpInLevel / 200) * 100));

  return (
    <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Caravan Name */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('hearth')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cinzel text-lg font-bold tracking-wider text-stone-100 group-hover:text-amber-400 transition-colors">
                  KITH
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Co-op PvE
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block truncate max-w-[180px]">
                {caravan?.name || 'Fellowship Expedition'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-stone-900/90 border border-stone-800/80 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => onSelectTab('hearth')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'hearth'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>The Hearth</span>
          </button>

          <button
            onClick={() => onSelectTab('quests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'quests'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Quests</span>
          </button>

          <button
            onClick={() => onSelectTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Expedition Feed</span>
          </button>
        </nav>

        {/* Right: Grace Mode Toggle, Profile Pill & Settings */}
        <div className="flex items-center gap-3">
          {/* Grace Mode ("Rest at the Hearth") Switch */}
          {profile && (
            <button
              onClick={toggleRestMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                profile.is_resting
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
              title="Grace Mode: Toggle 'Resting at the Hearth' during sickness, exams, or emergencies so your inactivity never penalizes the Caravan."
            >
              {profile.is_resting ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="hidden sm:inline">Resting at Hearth</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Grace Mode: Off</span>
                </>
              )}
            </button>
          )}

          {/* Profile Card / Level Pill */}
          {profile && (
            <div className="flex items-center gap-2.5 bg-stone-900/80 border border-stone-800 rounded-xl p-1.5 pr-3">
              <img
                src={
                  profile.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                }
                alt={profile.username}
                className="w-8 h-8 rounded-lg object-cover border border-stone-700"
              />
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-stone-200">
                    {profile.username.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${archetypeInfo.badgeBg}`}
                  >
                    Lvl {profile.level}
                  </span>
                </div>
                {/* Mini XP progress */}
                <div className="w-20 bg-stone-950 rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings Gear */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-stone-400 hover:text-stone-100 rounded-xl bg-stone-900/80 border border-stone-800 hover:bg-stone-800 transition"
            title="Settings (BYOK AI, Supabase, Sound)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Auth Trigger if Supabase active */}
          {!isSandbox && (
            <button
              onClick={profile ? signOut : onOpenAuth}
              className="p-2 text-stone-400 hover:text-stone-100 rounded-xl bg-stone-900/80 border border-stone-800 hover:bg-stone-800 transition"
              title={profile ? 'Sign Out' : 'Sign In'}
            >
              {profile ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Tabs (visible on small screens) */}
      <div className="flex md:hidden items-center justify-around gap-1 pt-2.5 mt-2 border-t border-stone-800/60">
        <button
          onClick={() => onSelectTab('hearth')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'hearth'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-stone-400'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hearth</span>
        </button>
        <button
          onClick={() => onSelectTab('quests')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'quests'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-stone-400'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Quests</span>
        </button>
        <button
          onClick={() => onSelectTab('logs')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'logs'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-stone-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Feed</span>
        </button>
      </div>
    </header>
  );
};
