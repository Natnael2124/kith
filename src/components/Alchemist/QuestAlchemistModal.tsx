import React, { useState } from 'react';
import { X, Wand2, Sparkles, Check, Plus, RefreshCw } from 'lucide-react';
import { QuestCategory } from '../../types';
import { CATEGORY_STYLES } from '../../lib/constants';
import { useCaravan } from '../../context/CaravanContext';
import { callAIQuestAlchemist, getStoredAISettings } from '../../lib/ai';

interface QuestAlchemistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransmutedQuest {
  title: string;
  category: QuestCategory;
  xp_value: number;
  campfire_value: number;
  selected: boolean;
}

const GOAL_INSPIRATIONS = [
  'Run my first 10k race',
  'Master conversational Spanish',
  'Deep work & launch my side project',
  'Digital detox & restored sleep routine',
  'Read 12 books in 3 months',
];

export const QuestAlchemistModal: React.FC<QuestAlchemistModalProps> = ({ isOpen, onClose }) => {
  const { createQuest } = useCaravan();
  const [goal, setGoal] = useState('');
  const [isAlchemizing, setIsAlchemizing] = useState(false);
  const [generatedQuests, setGeneratedQuests] = useState<TransmutedQuest[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAlchemize = async (targetGoal: string) => {
    if (!targetGoal.trim()) return;
    setIsAlchemizing(true);
    try {
      const aiSettings = getStoredAISettings();
      const results = await callAIQuestAlchemist(aiSettings, targetGoal.trim());
      setGeneratedQuests(results.map((q) => ({ ...q, selected: true })));
    } catch (err) {
      console.error('Alchemist error:', err);
    } finally {
      setIsAlchemizing(false);
    }
  };

  const toggleSelect = (index: number) => {
    setGeneratedQuests((prev) =>
      prev.map((q, i) => (i === index ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleAcceptQuests = async () => {
    setIsSaving(true);
    const toAdd = generatedQuests.filter((q) => q.selected);
    for (const q of toAdd) {
      await createQuest({
        title: q.title,
        category: q.category,
        xp_value: q.xp_value,
        campfire_value: q.campfire_value,
        target_date: new Date().toISOString().split('T')[0],
      });
    }
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <span>The Quest Alchemist</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                BYOK AI
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Transmute large aspirations into balanced daily habits across the four sacred pillars.
            </p>
          </div>
        </div>

        {/* Goal Input & Inspirations */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            What is your aspiration or target milestone?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Run a half marathon, Learn Spanish, Finish thesis draft..."
              onKeyDown={(e) => e.key === 'Enter' && handleAlchemize(goal)}
              className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-sm text-stone-100 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => handleAlchemize(goal)}
              disabled={isAlchemizing || !goal.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isAlchemizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmuting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transmute</span>
                </>
              )}
            </button>
          </div>

          {/* Inspiration chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-stone-500">Try:</span>
            {GOAL_INSPIRATIONS.map((insp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setGoal(insp);
                  handleAlchemize(insp);
                }}
                className="text-[11px] text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-800 transition"
              >
                {insp}
              </button>
            ))}
          </div>
        </div>

        {/* Results Box */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] pr-1 space-y-2.5">
          {generatedQuests.length > 0 ? (
            generatedQuests.map((q, idx) => {
              const style = CATEGORY_STYLES[q.category];
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelect(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    q.selected
                      ? 'bg-stone-950/80 border-purple-500/50 shadow-sm'
                      : 'bg-stone-950/30 border-stone-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition ${
                        q.selected
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {q.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}
                        >
                          {q.category}
                        </span>
                        <span className="text-[10px] text-amber-400 font-medium">
                          +{q.campfire_value}% Fire
                        </span>
                        <span className="text-[10px] text-sky-400 font-medium">
                          +{q.xp_value} XP
                        </span>
                      </div>
                      <p className="text-xs font-medium text-stone-200">{q.title}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center border border-dashed border-stone-800 rounded-xl bg-stone-950/20">
              <Sparkles className="w-7 h-7 text-purple-400/40 mb-2" />
              <p className="text-xs text-stone-400 font-medium">
                Enter an aspiration above to transmute it into daily quests.
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                The Alchemist balances Intellect, Vitality, Clarity, and Craft.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {generatedQuests.length > 0 && (
          <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-stone-800">
            <span className="text-xs text-stone-400">
              {generatedQuests.filter((q) => q.selected).length} of {generatedQuests.length} selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptQuests}
                disabled={isSaving || generatedQuests.filter((q) => q.selected).length === 0}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{isSaving ? 'Inscribing...' : 'Inscribe to My Quests'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
