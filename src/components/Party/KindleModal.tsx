import React, { useState } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import { Profile } from '../../types';
import { ARCHETYPES } from '../../lib/constants';
import { useCaravan } from '../../context/CaravanContext';

interface KindleModalProps {
  targetUser: Profile | null;
  onClose: () => void;
}

const QUICK_KINDLE_NOTES = [
  "Rest easy by the hearth, we've got the watch.",
  "Sending you warm spiced tea and quiet courage for today.",
  "Proud of your steady consistency. Take all the time you need.",
  "Your presence strengthens the whole Caravan!",
  "A spark of light for your trail ahead.",
];

export const KindleModal: React.FC<KindleModalProps> = ({ targetUser, onClose }) => {
  const { kindleCompanion } = useCaravan();
  const [selectedNote, setSelectedNote] = useState(QUICK_KINDLE_NOTES[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetUser) return null;

  const archetypeInfo = ARCHETYPES[targetUser.archetype];

  const handleKindle = async () => {
    setIsSubmitting(true);
    const finalNote = customNote.trim() || selectedNote;
    await kindleCompanion(targetUser.id, finalNote);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100">Kindle Companion</h3>
            <p className="text-xs text-stone-400">
              Send an uplifting spark to rekindle their spirit and fuel the campfire (+10% Fire).
            </p>
          </div>
        </div>

        {/* Companion Preview Card */}
        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <img
            src={targetUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.id}`}
            alt={targetUser.username}
            className="w-12 h-12 rounded-full border border-stone-700 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-stone-200 text-sm">{targetUser.username}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${archetypeInfo.badgeBg}`}>
                {targetUser.archetype}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Level {targetUser.level} • {targetUser.streak_days} Day Streak
              {targetUser.is_resting && ' • Resting at the Hearth'}
            </p>
          </div>
        </div>

        {/* Quick Message Options */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-300 mb-2">
            Choose an Encouragement:
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {QUICK_KINDLE_NOTES.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => {
                  setSelectedNote(note);
                  setCustomNote('');
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition border ${
                  selectedNote === note && !customNote
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                    : 'bg-stone-950/40 border-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                "{note}"
              </button>
            ))}
          </div>
        </div>

        {/* Custom Message input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Or write your own warm note:
          </label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g., Proud of you, rest well today!"
            maxLength={120}
            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleKindle}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Heart className="w-4 h-4 fill-stone-950" />
            <span>{isSubmitting ? 'Kindling...' : 'Kindle Companion (+10%)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
