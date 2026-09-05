import React, { useState } from 'react';
import { X, Plus, Sparkles, BookOpen, Activity, Hammer } from 'lucide-react';
import { QuestCategory } from '../../types';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: QuestCategory;
    xp_value: number;
    campfire_value: number;
  }) => Promise<void>;
}

const PRESETS: Array<{ title: string; category: QuestCategory; xp: number; campfire: number }> = [
  { title: 'Morning 20-minute movement & stretch', category: 'Vitality', xp: 25, campfire: 15 },
  { title: 'Read 1 chapter of inspiring non-fiction', category: 'Intellect', xp: 30, campfire: 20 },
  { title: '10 minutes of quiet mindfulness or journaling', category: 'Clarity', xp: 20, campfire: 15 },
  { title: 'Complete 1 focused deep work creation block', category: 'Craft', xp: 35, campfire: 20 },
  { title: 'Hydrate with fresh water and take screen break', category: 'Vitality', xp: 15, campfire: 10 },
];

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QuestCategory>('Vitality');
  const [xpValue, setXpValue] = useState(25);
  const [campfireValue, setCampfireValue] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await onSubmit({
      title: title.trim(),
      category,
      xp_value: xpValue,
      campfire_value: campfireValue,
    });
    setIsSubmitting(false);
    setTitle('');
    onClose();
  };

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setXpValue(preset.xp);
    setCampfireValue(preset.campfire);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100">Chart a New Daily Quest</h3>
            <p className="text-xs text-stone-400">
              Every habit completed provides firewood and moves the whole Caravan forward.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-400 mb-1.5">
            Quick Invocations:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-[11px] bg-stone-950/60 hover:bg-stone-800 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-800 transition"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Quest Title / Habit:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 30 minutes reading, 5k morning run..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Pillar / Category selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-2">
              Sacred Pillar (Category):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'Intellect', icon: BookOpen, color: 'text-blue-400', border: 'border-blue-500' },
                  { id: 'Vitality', icon: Activity, color: 'text-emerald-400', border: 'border-emerald-500' },
                  { id: 'Clarity', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500' },
                  { id: 'Craft', icon: Hammer, color: 'text-amber-400', border: 'border-amber-500' },
                ] as const
              ).map(({ id, icon: Icon, color, border }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                    category === id
                      ? `bg-stone-800 ${border} shadow-sm`
                      : 'bg-stone-950/50 border-stone-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs font-semibold text-stone-200">{id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Sliders */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-300 font-medium">XP Reward:</span>
                <span className="text-sky-400 font-bold">+{xpValue} XP</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={xpValue}
                onChange={(e) => setXpValue(Number(e.target.value))}
                className="w-full accent-sky-400 bg-stone-800"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-300 font-medium">Campfire Firewood:</span>
                <span className="text-amber-400 font-bold">+{campfireValue}% Fire</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={campfireValue}
                onChange={(e) => setCampfireValue(Number(e.target.value))}
                className="w-full accent-amber-400 bg-stone-800"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Inscribing...' : 'Inscribe Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
