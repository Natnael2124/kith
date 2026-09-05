import React, { useState } from 'react';
import { X, Flame, Mail, Lock, User, Check, ArrowRight } from 'lucide-react';
import { Archetype } from '../../types';
import { ARCHETYPES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [archetype, setArchetype] = useState<Archetype>('Wayfarer');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        onClose();
      } else {
        if (!username.trim()) throw new Error('Username is required.');
        const { error } = await signUpWithEmail(email, password, username.trim(), archetype);
        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 mb-3">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-stone-100 font-cinzel">
            {mode === 'signin' ? 'Return to the Hearth' : 'Join the Caravan'}
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-xs">
            {mode === 'signin'
              ? 'Sign in to reconnect with your caravan and shared campfire.'
              : 'Choose your archetype and embark on a cooperative life journey.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
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
                  placeholder="e.g., Rowan Swiftfoot"
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
                placeholder="companion@kith.io"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Secret Password:
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
            <span>{isLoading ? 'Attuning...' : mode === 'signin' ? 'Sign In' : 'Begin Journey'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>
            {mode === 'signin' ? "Don't have a caravan?" : 'Already traveling with us?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrorMsg('');
            }}
            className="text-amber-400 hover:underline font-semibold"
          >
            {mode === 'signin' ? 'Join as New Scout' : 'Sign In Instead'}
          </button>
        </div>
      </div>
    </div>
  );
};
