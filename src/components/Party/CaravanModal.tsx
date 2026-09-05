import React, { useState } from 'react';
import { X, Users, Plus, Key, ArrowRight } from 'lucide-react';
import { useCaravan } from '../../context/CaravanContext';

interface CaravanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaravanModal: React.FC<CaravanModalProps> = ({ isOpen, onClose }) => {
  const { createCaravan, joinCaravanByCode } = useCaravan();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createCaravan(name.trim(), motto.trim());
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create caravan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const ok = await joinCaravanByCode(inviteCode.trim());
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Caravan with that invite code could not be found.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to join caravan');
    } finally {
      setIsSubmitting(false);
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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100">Caravan Fellowship</h3>
            <p className="text-xs text-stone-400">
              Found a new fellowship or join an existing caravan with an invite code.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setTab('create');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition ${
              tab === 'create'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Found New Caravan
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('join');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition ${
              tab === 'join'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Join with Invite Code
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Caravan Name:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., The Mountain Striders"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Caravan Motto / Vow:
              </label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="e.g., Through every storm, our embers endure."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Founding...' : 'Found Caravan'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Caravan Invite Code:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SOLSTICE-77"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-100 uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !inviteCode.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? 'Seeking Caravan...' : 'Enter Fellowship'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
