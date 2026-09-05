import React, { useState } from 'react';
import {
  Flame,
  Moon,
  Users,
  Mail,
  Lock,
  User,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Archetype } from '../../types';
import { ARCHETYPES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';

export const LandingAuthView: React.FC = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [archetype, setArchetype] = useState<Archetype>('Wayfarer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        if (!username.trim()) throw new Error('Please choose a username.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const { error } = await signUpWithEmail(email, password, username.trim(), archetype);
        if (error) throw error;
        setSuccessMsg('Account created! Entering the hearth...');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Minimal Header */}
      <header className="border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <span className="font-cinzel text-xl font-bold tracking-wider text-stone-100">
                KITH
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Co-op Life Gamification
              </span>
            </div>
          </div>
          <span className="text-xs text-stone-400 hidden sm:inline">Cooperation, Not Comparison</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        {/* Left: Value Proposition */}
        <div className="flex-1 max-w-xl space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PvE Fellowship • Zero PvP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-cinzel text-stone-100 leading-tight">
            Turn your everyday life goals into a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              shared journey.
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
            No comparison, no leaderboards. Complete your daily habits to keep the shared campfire
            burning and advance your caravan together.
          </p>

          <div className="space-y-3 pt-2 text-left max-w-md mx-auto lg:mx-0">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong>The Campfire Engine:</strong> Completed habits feed seasoned firewood (+15%) and propel the party forward along expedition milestones.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <Moon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong>Grace Mode:</strong> Rest at the hearth when ill or busy. Your inactivity never penalizes the caravan.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong>Kindle Companions:</strong> Uplift struggling companions with warm sparks of encouragement to fuel the flame (+10%).
              </p>
            </div>
          </div>
        </div>

        {/* Right: Focused Authentication Card */}
        <div className="w-full max-w-md bg-stone-900/95 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="flex border-b border-stone-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition ${
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
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition ${
                mode === 'signup'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Create Account
            </button>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Username:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., Lyra Swift"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scout@kith.io"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
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
                  placeholder="At least 6 characters"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Choose Archetype:
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
                            ? 'bg-stone-800 border-amber-500/50 shadow-sm'
                            : 'bg-stone-950/40 border-stone-800 opacity-60 hover:opacity-100'
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Connecting...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-5 text-center text-xs text-stone-500">
        Kith: Cooperative Life-Gamification • Backed by Supabase
      </footer>
    </div>
  );
};
