import React, { useState } from 'react';
import { Flame, Sparkles, BookOpen, Moon, Clock } from 'lucide-react';
import { CaravanLogEntryType } from '../../types';
import { useCaravan } from '../../context/CaravanContext';
import { ChronicleModal } from './ChronicleModal';

export const ActivityFeed: React.FC = () => {
  const { logs } = useCaravan();
  const [filterType, setFilterType] = useState<CaravanLogEntryType | 'all'>('all');
  const [isChronicleOpen, setIsChronicleOpen] = useState(false);

  const filteredLogs = logs.filter((l) => (filterType === 'all' ? true : l.entry_type === filterType));

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getLogIcon = (type: CaravanLogEntryType) => {
    switch (type) {
      case 'quest_done':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'kindle_buff':
        return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'chronicle_story':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'rest_toggle':
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getLogBadge = (type: CaravanLogEntryType) => {
    switch (type) {
      case 'quest_done':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'kindle_buff':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'chronicle_story':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'rest_toggle':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getLogLabel = (type: CaravanLogEntryType) => {
    switch (type) {
      case 'quest_done':
        return 'Wood Gathered';
      case 'kindle_buff':
        return 'Spark Kindled';
      case 'chronicle_story':
        return 'Caravan Chronicle';
      case 'rest_toggle':
        return 'Grace Mode';
    }
  };

  return (
    <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <span>Caravan Expedition Feed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h3>
          <p className="text-xs text-stone-400">
            Realtime companion activity, campfire logs, and journey milestones.
          </p>
        </div>

        {/* Chronicler Button */}
        <button
          onClick={() => setIsChronicleOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-sm transition"
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Summon Chronicler</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {(
          [
            { id: 'all', label: 'All Entries' },
            { id: 'quest_done', label: 'Quests' },
            { id: 'kindle_buff', label: 'Kindles' },
            { id: 'chronicle_story', label: 'Chronicles' },
            { id: 'rest_toggle', label: 'Grace Mode' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilterType(id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
              filterType === id
                ? 'bg-stone-800 text-stone-100 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Logs Stream */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-stone-500 border border-dashed border-stone-800 rounded-xl">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No entries recorded in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3.5 rounded-xl border transition-all ${
                log.entry_type === 'chronicle_story'
                  ? 'bg-purple-950/15 border-purple-500/30 shadow-md'
                  : 'bg-stone-950/50 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Author Avatar or Icon */}
                {log.author_avatar ? (
                  <img
                    src={log.author_avatar}
                    alt={log.author_name || 'Companion'}
                    className="w-8 h-8 rounded-full border border-stone-700 object-cover mt-0.5"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center mt-0.5">
                    {getLogIcon(log.entry_type)}
                  </div>
                )}

                {/* Log Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-stone-200">
                        {log.author_name || 'Caravan'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getLogBadge(
                          log.entry_type
                        )}`}
                      >
                        {getLogLabel(log.entry_type)}
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-500">
                      {formatTimeAgo(log.created_at)}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      log.entry_type === 'chronicle_story'
                        ? 'font-serif italic text-purple-200/90'
                        : 'text-stone-300'
                    }`}
                  >
                    {log.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chronicle Modal */}
      <ChronicleModal isOpen={isChronicleOpen} onClose={() => setIsChronicleOpen(false)} />
    </div>
  );
};
