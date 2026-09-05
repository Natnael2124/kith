import React, { useState } from 'react';
import { Sparkles, Moon, Copy, Check, Users, Compass, Shield, BookOpen, Hammer } from 'lucide-react';
import { Profile, Archetype } from '../../types';
import { ARCHETYPES } from '../../lib/constants';
import { useCaravan } from '../../context/CaravanContext';
import { useAuth } from '../../context/AuthContext';
import { KindleModal } from './KindleModal';

export const PartyRoster: React.FC = () => {
  const { caravan, partyMembers } = useCaravan();
  const { profile } = useAuth();
  const [kindleTarget, setKindleTarget] = useState<Profile | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const getArchetypeIcon = (archetype: Archetype) => {
    switch (archetype) {
      case 'Wayfarer':
        return <Compass className="w-3.5 h-3.5" />;
      case 'Warden':
        return <Shield className="w-3.5 h-3.5" />;
      case 'Sage':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Artisan':
        return <Hammer className="w-3.5 h-3.5" />;
    }
  };

  const handleCopyInvite = () => {
    if (caravan?.invite_code) {
      navigator.clipboard.writeText(caravan.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header with Caravan name & Invite Code */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-stone-100">
              {caravan?.name || 'The Caravan Fellowship'}
            </h3>
          </div>
          {caravan?.motto && (
            <p className="text-xs text-stone-400 italic mt-0.5">"{caravan.motto}"</p>
          )}
        </div>

        {/* Invite Code Pill */}
        {caravan?.invite_code && (
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-2 bg-stone-950/70 border border-stone-700/80 hover:border-amber-500/50 px-3 py-1.5 rounded-xl text-xs text-stone-300 hover:text-stone-100 transition group"
            title="Copy Invite Code to share with friends"
          >
            <span className="text-stone-500 text-[11px]">Invite Code:</span>
            <span className="font-mono font-bold text-amber-400">{caravan.invite_code}</span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition" />
            )}
          </button>
        )}
      </div>

      {/* Companions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
        {partyMembers.map((member) => {
          const isMe = member.id === profile?.id;
          const archetypeDetails = ARCHETYPES[member.archetype];

          return (
            <div
              key={member.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 ${
                member.is_resting
                  ? 'bg-indigo-950/20 border-indigo-500/30'
                  : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Resting overlay badge */}
              {member.is_resting && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                  <Moon className="w-3 h-3 text-indigo-400 animate-pulse" />
                  <span>Resting at Hearth</span>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={
                      member.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${member.id}`
                    }
                    alt={member.username}
                    className={`w-11 h-11 rounded-full object-cover border-2 ${
                      member.is_resting ? 'border-indigo-400/50 opacity-90' : 'border-stone-700'
                    }`}
                  />
                  {/* Archetype mini badge */}
                  <div
                    className={`absolute -bottom-1 -right-1 p-0.5 rounded-full bg-stone-900 border ${archetypeDetails.badgeBg}`}
                    title={member.archetype}
                  >
                    {getArchetypeIcon(member.archetype)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-16">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-sm text-stone-200 truncate">
                      {member.username}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                    <span className="font-medium text-stone-300">Lvl {member.level}</span>
                    <span>•</span>
                    <span className={archetypeDetails.color}>{member.archetype}</span>
                    <span>•</span>
                    <span>{member.streak_days}d streak</span>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-1 truncate">
                    {archetypeDetails.passiveBonus}
                  </p>
                </div>
              </div>

              {/* Bottom Actions: Kindle button */}
              {!isMe && (
                <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">Companion in party</span>
                  <button
                    onClick={() => setKindleTarget(member)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kindle (+10%)</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kindle modal */}
      {kindleTarget && (
        <KindleModal targetUser={kindleTarget} onClose={() => setKindleTarget(null)} />
      )}
    </div>
  );
};
