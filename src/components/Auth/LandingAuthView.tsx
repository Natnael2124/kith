import React, { useState } from 'react';
import {
  Flame,
  Moon,
  Sparkles,
  Users,
  Mail,
  Lock,
  User,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Archetype } from '../../types';
import { ARCHETYPES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';

export const LandingAuthView: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGitHub } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [archetype, setArchetype] = useState<Archetype>('Wayfarer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else {
        if (!username.trim()) throw new Error('Please choose a scout username.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const { error } = await signUpWithEmail(email, password, username.trim(), archetype);
        if (error) throw error;
        setSuccessMsg('Account created! Logging in to your hearth...');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setErrorMsg('');
    setIsGitHubLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) throw error;
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'GitHub authentication failed');
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Banner */}
      <header className="border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <span className="font-cinzel text-xl font-bold tracking-wider text-stone-100">
                KITH
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Co-op PvE
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-400 hidden sm:flex items-center gap-2">
            <span>Cooperation, Not Comparison</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Vision & Philosophy */}
        <div className="flex-1 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cooperative Life-Gamification Expedition</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-tight text-stone-100 leading-tight">
            When one member advances,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              the entire Caravan moves forward.
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Zero toxic leaderboards, zero PvP, and zero surveillance. Kith unites parties of companions
            around a shared <strong>Campfire</strong> that stays ablaze through your real-world daily rituals.
          </p>

          {/* Pillars & Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Flame className="w-4 h-4" />
                <span>The Campfire Engine</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Your habits feed seasoned firewood to the hearth (+15%). When one companion struggles,
                the fellowship shares the load.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                <Moon className="w-4 h-4" />
                <span>Grace Mode ("Rest at Hearth")</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Sick, traveling, or burnt out? Toggle Rest status. Your inactivity will never penalize
                your Caravan's expedition distance.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Users className="w-4 h-4" />
                <span>Companion Kindling</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Send kindling sparks and heartwarming notes to lift up companions, reigniting campfire
                heat (+10%) in real time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>BYOK AI Suite</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Unlock the AI Chronicler for weekly expedition lore and the Quest Alchemist to transmute
                big dreams into daily habits.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-stone-100 font-cinzel">
              {mode === 'signin' ? 'Return to the Hearth' : 'Inscribe Your Name'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {mode === 'signin'
                ? 'Sign in to sync with your companions and shared campfire.'
                : 'Choose your archetype and join a fellowship.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-stone-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                mode === 'signin'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                mode === 'signup'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* GitHub 1-Click OAuth Button */}
          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={isGitHubLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-stone-600 text-stone-200 text-xs font-semibold transition flex items-center justify-center gap-2 mb-4 shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{isGitHubLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-stone-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-stone-500 uppercase tracking-wider">
              Or with email
            </span>
            <div className="flex-grow border-t border-stone-800"></div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Scout Username:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., Lyra Hearthwatcher"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Email Address:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scout@caravan.io"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Archetype Selector on Signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Choose Your Archetype:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Wayfarer', 'Warden', 'Sage', 'Artisan'] as const).map((arch) => {
                    const info = ARCHETYPES[arch];
                    return (
                      <button
                        key={arch}
                        type="button"
                        onClick={() => setArchetype(arch)}
                        className={`p-2 rounded-xl border text-left transition ${
                          archetype === arch
                            ? 'bg-stone-800 border-amber-500/50'
                            : 'bg-stone-950/40 border-stone-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${info.color}`}>{info.title}</span>
                          {archetype === arch && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{info.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
            >
              <span>{isLoading ? 'Connecting...' : mode === 'signin' ? 'Sign In to Hearth' : 'Begin Journey'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-6 text-center text-xs text-stone-500">
        Kith • Cooperative Life Gamification • Backed by Supabase & Gemini 2.5 Flash
      </footer>
    </div>
  );
};
