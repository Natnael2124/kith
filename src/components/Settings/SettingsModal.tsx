import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Key,
  Database,
  Volume2,
  User,
  Check,
  Sparkles,
  AlertCircle,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { AIProvider, Archetype } from '../../types';
import { getStoredAISettings, saveStoredAISettings } from '../../lib/ai';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  sandboxStore,
} from '../../lib/supabase';
import { sound } from '../../lib/sound';
import { useAuth } from '../../context/AuthContext';
import { ARCHETYPES } from '../../lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, isSandbox, updateProfile, switchSandboxUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'ai' | 'supabase' | 'sound' | 'profile'>('ai');

  // AI State
  const initialAI = getStoredAISettings();
  const [provider, setProvider] = useState<AIProvider>(initialAI.provider);
  const [apiKey, setApiKey] = useState(initialAI.apiKey);
  const [aiTestResult, setAiTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  // Supabase State
  const initialSupabase = getStoredSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(initialSupabase.url);
  const [sbAnonKey, setSbAnonKey] = useState(initialSupabase.anonKey);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Sound State
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [soundVolume, setSoundVolume] = useState(sound.getVolume());

  // Profile Edit State
  const [username, setUsername] = useState(profile?.username || '');
  const [archetype, setArchetype] = useState<Archetype>(profile?.archetype || 'Wayfarer');
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isOpen) return null;

  // AI Save
  const handleSaveAI = () => {
    saveStoredAISettings({
      provider,
      apiKey: apiKey.trim(),
      model:
        provider === 'gemini'
          ? 'gemini-1.5-flash'
          : provider === 'openai'
          ? 'gpt-4o-mini'
          : 'claude-3-5-sonnet-latest',
    });
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  // AI Test
  const handleTestAI = async () => {
    if (!apiKey.trim()) {
      setAiTestResult({ ok: false, message: 'Please enter an API key first.' });
      return;
    }
    setIsTestingAI(true);
    setAiTestResult(null);

    try {
      if (provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with the single word: "Kindled"' }] }],
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
        setAiTestResult({ ok: true, message: 'Success! Connected to Gemini API.' });
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setAiTestResult({ ok: true, message: 'Success! Connected to OpenAI API.' });
      } else if (provider === 'claude') {
        setAiTestResult({
          ok: true,
          message: 'Key saved. Claude calls will run with dangerously-allow-browser.',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setAiTestResult({ ok: false, message: `Validation failed: ${message}` });
    } finally {
      setIsTestingAI(false);
    }
  };

  // Supabase Save
  const handleSaveSupabase = () => {
    if (!sbUrl || !sbAnonKey) {
      alert('Please fill in both Supabase URL and Anon Key.');
      return;
    }
    saveStoredSupabaseConfig(sbUrl, sbAnonKey);
  };

  const handleResetSandbox = () => {
    if (confirm('Reset to local Sandbox Mode? This will clear stored Supabase credentials.')) {
      clearStoredSupabaseConfig();
    }
  };

  const handleCopySchema = () => {
    // Read schema or instruct user to copy schema.sql
    navigator.clipboard.writeText(
      `-- Copy full schema from schema.sql in the repo and execute in Supabase SQL Editor!`
    );
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  // Sound changes
  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  const handleVolumeChange = (vol: number) => {
    sound.setVolume(vol);
    setSoundVolume(vol);
  };

  // Profile Save
  const handleSaveProfile = async () => {
    if (!username.trim()) return;
    await updateProfile({ username: username.trim(), archetype });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100">Caravan Settings & Configuration</h3>
            <p className="text-xs text-stone-400">
              Manage your BYOK AI keys, Supabase backend, soundscape, and companion profile.
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-stone-800 gap-2 mb-5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'ai', label: 'BYOK AI Keys', icon: Key },
              { id: 'supabase', label: 'Supabase DB', icon: Database },
              { id: 'sound', label: 'Hearth Sound', icon: Volume2 },
              { id: 'profile', label: 'Profile & Party', icon: User },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition -mb-px shrink-0 ${
                activeTab === id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: BYOK AI */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Bring Your Own Key (BYOK)
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Stored Locally in Browser
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Kith works completely standalone with deterministic gameplay rules and procedural
                  lore. By providing your personal API key, you unlock the full <strong>AI Chronicler</strong> and <strong>Quest Alchemist</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Select AI Provider:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'gemini', label: 'Google Gemini', sub: 'Free Tier Friendly' },
                      { id: 'openai', label: 'OpenAI', sub: 'GPT-4o / mini' },
                      { id: 'claude', label: 'Anthropic Claude', sub: 'Claude 3.5' },
                    ] as const
                  ).map(({ id, label, sub }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setProvider(id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        provider === id
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  {provider === 'gemini'
                    ? 'Google Gemini API Key (Get free at aistudio.google.com):'
                    : provider === 'openai'
                    ? 'OpenAI API Key (sk-...):'
                    : 'Anthropic API Key (sk-ant-...):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      provider === 'gemini'
                        ? 'AIzaSy...'
                        : provider === 'openai'
                        ? 'sk-proj-...'
                        : 'sk-ant-...'
                    }
                    className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestAI}
                    disabled={isTestingAI || !apiKey.trim()}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition disabled:opacity-50"
                  >
                    {isTestingAI ? 'Testing...' : 'Test Key'}
                  </button>
                </div>
              </div>

              {aiTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    aiTestResult.ok
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {aiTestResult.ok ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{aiTestResult.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveAI}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  {aiSaved ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  <span>{aiSaved ? 'AI Key Saved!' : 'Save AI Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SUPABASE CONFIG */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isSandbox
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Database className="w-4 h-4" />
                  <span>
                    Current Backend: <strong>{isSandbox ? 'Local Sandbox Mode (Zero Setup)' : 'Live Supabase Cloud'}</strong>
                  </span>
                </div>
                {!isSandbox && (
                  <button
                    onClick={handleResetSandbox}
                    className="text-[11px] underline text-stone-400 hover:text-stone-200"
                  >
                    Switch to Sandbox
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Supabase Project URL:
                </label>
                <input
                  type="text"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Supabase Anon Key:
                </label>
                <input
                  type="password"
                  value={sbAnonKey}
                  onChange={(e) => setSbAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 text-xs text-stone-400 space-y-2">
                <div className="font-semibold text-stone-300 flex items-center justify-between">
                  <span>Database Setup Reminder:</span>
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSchema ? 'SQL Path Copied!' : 'schema.sql in repo'}</span>
                  </button>
                </div>
                <p>
                  Before connecting, execute the included <code>schema.sql</code> in your Supabase SQL Editor to create the 4 tables, foreign keys, RLS policies, and triggers.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {isSandbox && (
                  <button
                    type="button"
                    onClick={() => {
                      sandboxStore.resetDemoData();
                      alert('Sandbox demo data has been reset to defaults.');
                    }}
                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Caravan Data</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveSupabase}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 ml-auto"
                >
                  <Database className="w-4 h-4" />
                  <span>Connect Supabase Backend</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SOUND & AMBIENCE */}
          {activeTab === 'sound' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-200">Audio Feedback & Sound Effects</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Synthesized procedural crackling campfire and harmonic harp chimes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    soundEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-300 font-medium">Campfire & Chime Volume:</span>
                  <span className="text-amber-400 font-bold">{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 bg-stone-800"
                />
              </div>

              <div className="p-3 bg-stone-950/40 border border-stone-800/80 rounded-xl text-xs text-stone-500">
                Sounds are generated directly in your browser using the Web Audio API without needing any external audio downloads.
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & PARTY */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Companion Username:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Archetype Specialization:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Wayfarer', 'Warden', 'Sage', 'Artisan'] as const).map((arch) => {
                    const info = ARCHETYPES[arch];
                    return (
                      <button
                        key={arch}
                        type="button"
                        onClick={() => setArchetype(arch)}
                        className={`p-3 rounded-xl border text-left transition ${
                          archetype === arch
                            ? `bg-stone-800 border-amber-500/50 shadow-sm`
                            : 'bg-stone-950/40 border-stone-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${info.color}`}>{info.title}</span>
                          {archetype === arch && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1">{info.passiveBonus}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  {profileSaved ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{profileSaved ? 'Profile Updated!' : 'Save Profile Changes'}</span>
                </button>
              </div>

              {/* Sandbox Companion Switcher */}
              {isSandbox && (
                <div className="pt-4 border-t border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-300">
                      Sandbox Companion Switcher:
                    </span>
                    <span className="text-[10px] text-stone-500">Test different party roles</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sandboxStore.getProfiles().map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => switchSandboxUser(p.id)}
                        className={`p-2 rounded-xl border text-center transition ${
                          p.id === profile?.id
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <img
                          src={p.avatar_url || ''}
                          alt={p.username}
                          className="w-8 h-8 rounded-full mx-auto mb-1 border border-stone-700"
                        />
                        <div className="text-xs font-semibold truncate">{p.username.split(' ')[0]}</div>
                        <div className="text-[10px] text-stone-500">{p.archetype}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
