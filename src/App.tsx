import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaravanProvider, useCaravan } from './context/CaravanContext';
import { Navbar } from './components/UI/Navbar';
import { CampfireCanvas } from './components/Campfire/CampfireCanvas';
import { CampfireHUD } from './components/Campfire/CampfireHUD';
import { PartyRoster } from './components/Party/PartyRoster';
import { QuestList } from './components/Quests/QuestList';
import { ActivityFeed } from './components/Logs/ActivityFeed';
import { QuestAlchemistModal } from './components/Alchemist/QuestAlchemistModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { CaravanModal } from './components/Party/CaravanModal';
import {
  Flame,
  Shield,
  Moon,
  Sparkles,
  Users,
  ArrowRight,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { profile, toggleRestMode, isSandbox } = useAuth();
  const { caravan, quests, logs } = useCaravan();

  const [activeTab, setActiveTab] = useState<'hearth' | 'quests' | 'logs'>('hearth');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAlchemistOpen, setIsAlchemistOpen] = useState(false);
  const [isCaravanModalOpen, setIsCaravanModalOpen] = useState(false);

  const campfireLevel = caravan?.campfire_level ?? 75;
  const completedToday = quests.filter((q) => q.is_completed).length;

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Resting at Hearth Banner (Grace Mode active) */}
        {profile?.is_resting && (
          <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-stone-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-indigo-950/30 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Moon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-indigo-200 flex items-center gap-2">
                  <span>Grace Mode Active ("Rest at the Hearth")</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold uppercase">
                    Penalties Paused
                  </span>
                </h4>
                <p className="text-xs text-indigo-300/80 mt-0.5 max-w-xl">
                  You are resting peacefully by the campfire stones. Your inactivity does not diminish
                  the Caravan's campfire or expedition distance. Recover well!
                </p>
              </div>
            </div>
            <button
              onClick={toggleRestMode}
              className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition shrink-0"
            >
              Resume Journey
            </button>
          </div>
        )}

        {/* TAB 1: THE HEARTH (Central Campfire & Party View) */}
        {activeTab === 'hearth' && (
          <div className="space-y-6">
            {/* Hero Campfire Display */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900/90 via-stone-950/95 to-[#0c0a09] border border-stone-800/80 p-6 lg:p-8 shadow-2xl">
              {/* Background ambient radial glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none transition-all duration-700 blur-3xl opacity-20"
                style={{
                  backgroundColor: campfireLevel > 50 ? '#f59e0b' : '#ef4444',
                }}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Interactive Canvas Campfire */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <CampfireCanvas campfireLevel={campfireLevel} />
                  <div className="text-center mt-2">
                    <p className="text-xs font-medium text-stone-400">
                      The Caravan Campfire •{' '}
                      <span className="text-amber-400 font-bold">{campfireLevel}% Brightness</span>
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Click the fire to stir up ember sparks!
                    </p>
                  </div>
                </div>

                {/* Right: Campfire HUD & Milestones */}
                <div className="lg:col-span-7 space-y-4">
                  <CampfireHUD />

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      onClick={() => setActiveTab('quests')}
                      className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4 fill-stone-950" />
                      <span>Tend Fire (Daily Quests)</span>
                    </button>

                    <button
                      onClick={() => setIsAlchemistOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>AI Quest Alchemist</span>
                    </button>

                    <button
                      onClick={() => setIsCaravanModalOpen(true)}
                      className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Switch Caravan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Grid: Companions & Quests Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Party Companions Roster */}
              <div className="lg:col-span-7">
                <PartyRoster />
              </div>

              {/* Right Column: Daily Quests Overview & Recent Deeds */}
              <div className="lg:col-span-5 space-y-6">
                {/* Quests Glance Card */}
                <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Today's Rituals</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('quests')}
                      className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>View All ({quests.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {quests.slice(0, 3).map((q) => (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          q.is_completed
                            ? 'bg-stone-950/40 border-stone-800/60 opacity-70 line-through text-stone-500'
                            : 'bg-stone-950/60 border-stone-800 text-stone-200'
                        }`}
                      >
                        <span className="truncate">{q.title}</span>
                        <span className="shrink-0 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          +{q.campfire_value}% Fire
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
                    <span>
                      {completedToday} of {quests.length} completed today
                    </span>
                    <button
                      onClick={() => setActiveTab('quests')}
                      className="text-stone-300 hover:text-white font-medium underline"
                    >
                      Open Quest Log
                    </button>
                  </div>
                </div>

                {/* Recent Feed Snippet */}
                <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-stone-100">Expedition Feed</h3>
                    <button
                      onClick={() => setActiveTab('logs')}
                      className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Full Feed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {logs.slice(0, 2).map((l) => (
                      <div
                        key={l.id}
                        className="text-xs p-2.5 rounded-xl bg-stone-950/50 border border-stone-800 text-stone-300 leading-relaxed"
                      >
                        <strong className="text-amber-400">{l.author_name || 'Companion'}:</strong>{' '}
                        {l.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY QUESTS & HABITS */}
        {activeTab === 'quests' && (
          <div className="space-y-6">
            <QuestList onOpenAlchemist={() => setIsAlchemistOpen(true)} />
          </div>
        )}

        {/* TAB 3: EXPEDITION LOGS & CHRONICLER */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <ActivityFeed />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-800/80 bg-stone-950/80 py-8 px-4 text-center text-xs text-stone-400">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-center items-center gap-6 font-medium text-stone-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-4 h-4" />
              The Campfire Engine
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-4 h-4" />
              Cooperative PvE Union
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Moon className="w-4 h-4" />
              Grace Mode Protection
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <Sparkles className="w-4 h-4" />
              BYOK AI Chronicler
            </span>
          </div>

          <p className="text-stone-400 max-w-xl mx-auto leading-relaxed">
            Kith is built on cooperation, not comparison. Zero PvP, no toxic leaderboards, and no
            surveillance verification. When one member advances, the entire Caravan moves forward.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400 pt-2">
            <span>Mode: {isSandbox ? 'Local Sandbox (Offline Ready)' : 'Supabase Live Cloud'}</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-amber-400 hover:underline"
            >
              Configure BYOK / Supabase
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCaravanModalOpen(true)}
              className="text-stone-300 hover:underline"
            >
              Found or Join Caravan
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <QuestAlchemistModal isOpen={isAlchemistOpen} onClose={() => setIsAlchemistOpen(false)} />
      <CaravanModal isOpen={isCaravanModalOpen} onClose={() => setIsCaravanModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CaravanProvider>
        <MainContent />
      </CaravanProvider>
    </AuthProvider>
  );
}

export default App;
