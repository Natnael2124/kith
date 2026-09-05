import React from 'react';
import { Check, Trash2, Flame, Sparkles, BookOpen, Activity, Hammer } from 'lucide-react';
import { Quest, QuestCategory } from '../../types';
import { CATEGORY_STYLES } from '../../lib/constants';

interface QuestCardProps {
  quest: Quest;
  onToggle: (questId: string) => void;
  onDelete: (questId: string) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onToggle, onDelete }) => {
  const style = CATEGORY_STYLES[quest.category];

  const getCategoryIcon = (category: QuestCategory) => {
    switch (category) {
      case 'Intellect':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Vitality':
        return <Activity className="w-3.5 h-3.5" />;
      case 'Clarity':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Craft':
        return <Hammer className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`group relative rounded-xl p-4 border transition-all duration-300 ${
        quest.is_completed
          ? 'bg-stone-950/40 border-stone-800/60 opacity-75'
          : `bg-stone-900/90 hover:bg-stone-900 border-stone-800 hover:${style.border} shadow-lg shadow-black/20`
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(quest.id)}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 ${
            quest.is_completed
              ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : 'border-stone-700 bg-stone-950/80 hover:border-amber-500 text-transparent'
          }`}
          aria-label={quest.is_completed ? 'Mark uncompleted' : 'Mark completed'}
        >
          <Check className={`w-4 h-4 stroke-[3] ${quest.is_completed ? 'scale-100' : 'scale-0'}`} />
        </button>

        {/* Quest Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Category badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}
            >
              {getCategoryIcon(quest.category)}
              <span>{quest.category}</span>
            </span>

            {/* Campfire fuel badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>+{quest.campfire_value}% Fire</span>
            </span>

            {/* XP badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400/90 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              <span>+{quest.xp_value} XP</span>
            </span>
          </div>

          <h4
            className={`text-sm font-medium transition-all ${
              quest.is_completed
                ? 'line-through text-stone-500'
                : 'text-stone-200 group-hover:text-stone-100'
            }`}
          >
            {quest.title}
          </h4>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(quest.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800"
          title="Delete quest"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
