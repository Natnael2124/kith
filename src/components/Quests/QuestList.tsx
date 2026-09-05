import React, { useState } from 'react';
import { Plus, Wand2, ListFilter } from 'lucide-react';
import { QuestCategory } from '../../types';
import { QuestCard } from './QuestCard';
import { CreateQuestModal } from './CreateQuestModal';
import { useCaravan } from '../../context/CaravanContext';

interface QuestListProps {
  onOpenAlchemist: () => void;
}

export const QuestList: React.FC<QuestListProps> = ({ onOpenAlchemist }) => {
  const { quests, completeQuest, uncompleteQuest, createQuest, deleteQuest } = useCaravan();
  const [activeCategory, setActiveCategory] = useState<QuestCategory | 'All'>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredQuests = quests.filter((q) =>
    activeCategory === 'All' ? true : q.category === activeCategory
  );

  const completedCount = quests.filter((q) => q.is_completed).length;
  const totalCount = quests.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleToggle = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;
    if (quest.is_completed) {
      await uncompleteQuest(questId);
    } else {
      await completeQuest(questId);
    }
  };

  return (
    <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <span>My Daily Quests & Habits</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
              {completedCount}/{totalCount} Completed
            </span>
          </h3>
          <p className="text-xs text-stone-400">
            Fulfill your daily rituals to feed firewood to the Hearth and advance the Caravan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Quest Alchemist trigger */}
          <button
            onClick={onOpenAlchemist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
            title="Break big dreams into balanced quests with AI Quest Alchemist"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Quest Alchemist</span>
          </button>

          {/* Add custom quest */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Chart Quest</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-950/60 rounded-full h-2 mb-5 border border-stone-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {(['All', 'Vitality', 'Intellect', 'Clarity', 'Craft'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeCategory === cat
                ? 'bg-stone-800 text-stone-100 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quests List */}
      {filteredQuests.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-stone-800 rounded-xl bg-stone-950/30">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-800/80 flex items-center justify-center text-stone-500">
            <ListFilter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-stone-300">No quests in this category</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Chart a new daily quest or use the Quest Alchemist to transmute your goals into daily habits.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg transition"
            >
              + Add Custom Quest
            </button>
            <button
              onClick={onOpenAlchemist}
              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg transition"
            >
              Use Quest Alchemist
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onToggle={handleToggle}
              onDelete={(id) => deleteQuest(id)}
            />
          ))}
        </div>
      )}

      {/* Create Quest Modal */}
      <CreateQuestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (data) => {
          await createQuest(data);
        }}
      />
    </div>
  );
};
