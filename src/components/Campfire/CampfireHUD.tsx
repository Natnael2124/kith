import React, { useState } from 'react';
import { Flame, Compass, Volume2, VolumeX, Moon, Sparkles, ShieldCheck } from 'lucide-react';
import { useCaravan } from '../../context/CaravanContext';
import { EXPEDITION_MILESTONES } from '../../lib/constants';
import { sound } from '../../lib/sound';

export const CampfireHUD: React.FC = () => {
  const { caravan, partyMembers } = useCaravan();
  const [isPlayingAudio, setIsPlayingAudio] = useState(sound.isCampfireActive());

  const campfireLevel = caravan?.campfire_level ?? 75;
  const distance = caravan?.expedition_distance ?? 0;

  // Determine current and next milestone
  let currentMilestone = EXPEDITION_MILESTONES[0];
  let nextMilestone = EXPEDITION_MILESTONES[1];

  for (let i = 0; i < EXPEDITION_MILESTONES.length; i++) {
    if (distance >= EXPEDITION_MILESTONES[i].distance) {
      currentMilestone = EXPEDITION_MILESTONES[i];
      nextMilestone = EXPEDITION_MILESTONES[i + 1] || EXPEDITION_MILESTONES[i];
    }
  }

  const distanceToNext = Math.max(0, nextMilestone.distance - distance);
  const milestoneProgress =
    nextMilestone.distance === currentMilestone.distance
      ? 100
      : Math.min(
          100,
          Math.round(
            ((distance - currentMilestone.distance) /
              (nextMilestone.distance - currentMilestone.distance)) *
              100
          )
        );

  const getFlameStatus = (lvl: number) => {
    if (lvl >= 80) return { title: 'Roaring Bonfire', color: 'text-amber-400', desc: 'The party is blazing forward in total union!' };
    if (lvl >= 50) return { title: 'Warm Hearth', color: 'text-amber-300', desc: 'A steady, comforting flame shelters the caravan.' };
    if (lvl >= 25) return { title: 'Gentle Embers', color: 'text-orange-400', desc: 'The fire is waning. Complete habits to feed the wood!' };
    return { title: 'Smoldering Ashes', color: 'text-rose-400', desc: 'The flame is faint! Kindle your companions now.' };
  };

  const flameStatus = getFlameStatus(campfireLevel);
  const restingCount = partyMembers.filter((m) => m.is_resting).length;

  const handleToggleSound = () => {
    const newState = sound.toggleCampfireAmbience();
    setIsPlayingAudio(newState);
  };

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Top row: Campfire level & Audio Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame className={`w-6 h-6 ${campfireLevel > 40 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Shared Campfire Light
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {campfireLevel}%
              </span>
            </div>
            <h2 className={`text-lg font-bold ${flameStatus.color}`}>
              {flameStatus.title}
            </h2>
          </div>
        </div>

        {/* Ambient sound toggle button */}
        <button
          onClick={handleToggleSound}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            isPlayingAudio
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-stone-800/60 text-stone-400 border-stone-700 hover:text-stone-200 hover:bg-stone-800'
          }`}
          title="Toggle ambient crackling fire audio"
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Hearth Fire Sound: On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Hearth Fire Sound: Off</span>
            </>
          )}
        </button>
      </div>

      {/* Campfire Progress Bar */}
      <div className="w-full bg-stone-950/70 rounded-full h-3.5 p-0.5 border border-stone-800 mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
          style={{ width: `${Math.max(4, campfireLevel)}%` }}
        />
      </div>
      <p className="text-xs text-stone-400 mb-6 flex items-center justify-between">
        <span>{flameStatus.desc}</span>
        <span className="text-stone-500 text-[11px]">+15% per habit completed</span>
      </p>

      {/* Expedition Milestones & Distance Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-800/60">
        <div className="bg-stone-950/50 rounded-xl p-3.5 border border-stone-800/50">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-4 h-4 text-sky-400" />
              Expedition Distance
            </span>
            <span className="font-bold text-sky-400">{distance} Leagues</span>
          </div>
          <div className="text-sm font-semibold text-stone-200 truncate">
            {currentMilestone.name}
          </div>
          <div className="text-xs text-stone-500 truncate">{currentMilestone.desc}</div>

          {nextMilestone.name !== currentMilestone.name && (
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                <span>Next: {nextMilestone.name}</span>
                <span>{distanceToNext} leagues away</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Party Status Summary */}
        <div className="bg-stone-950/50 rounded-xl p-3.5 border border-stone-800/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cooperative PvE Fellowship
              </span>
              <span className="text-stone-400 font-bold">{partyMembers.length} Companions</span>
            </div>
            <p className="text-xs text-stone-400">
              No PvP or competition. Every quest completed feeds firewood and moves the whole caravan ahead.
            </p>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            {restingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                {restingCount} resting at the hearth (penalties paused)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 bg-stone-800/40 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                All companions actively scouting the trail
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
