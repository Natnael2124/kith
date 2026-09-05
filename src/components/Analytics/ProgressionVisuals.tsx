import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  Flame,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCaravan } from '../../context/CaravanContext';
import { fetchFocusSessions, getRatingTier } from '../../lib/focusStorage';
import { FocusSession } from '../../types';

interface ProgressionVisualsProps {
  onStartFocus?: () => void;
}

export const ProgressionVisuals: React.FC<ProgressionVisualsProps> = ({ onStartFocus }) => {
  const { profile } = useAuth();
  const { quests } = useCaravan();

  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    session: FocusSession;
  } | null>(null);

  const [hoveredHeatmapDay, setHoveredHeatmapDay] = useState<{
    dateStr: string;
    displayDate: string;
    questCount: number;
    focusCount: number;
    totalScore: number;
  } | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchFocusSessions(profile.id).then((data) => {
        setSessions(data);
      });
    }
  }, [profile?.id]);

  const currentRating = profile?.rating ?? 1200;
  const peakRating = profile?.peak_rating ?? Math.max(1200, currentRating);
  const currentTier = getRatingTier(currentRating);
  const peakTier = getRatingTier(peakRating);

  // Total Focus Minutes
  const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 25), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Completed Quests
  const totalCompletedQuests = quests.filter((q) => q.is_completed).length;

  // -------------------------------------------------------------
  // 1. Codeforces-Style Rating Graph Coordinates
  // -------------------------------------------------------------
  const chartData = useMemo(() => {
    // If no sessions, provide starting baseline
    if (sessions.length === 0) {
      return [
        {
          index: 0,
          rating: 1200,
          session: {
            id: 'init',
            user_id: profile?.id || '',
            target_intent: 'Initiation at the Sacred Hearth',
            actual_outcome: 'Began the Kith expedition.',
            duration_minutes: 0,
            rating_delta: 0,
            new_rating: 1200,
            feedback: 'Welcome to the Fellowship. Every journey begins with a first vow.',
            created_at: profile?.created_at || new Date().toISOString(),
          } as FocusSession,
        },
      ];
    }

    // Baseline point + each session
    const points = [
      {
        index: 0,
        rating: 1200,
        session: {
          id: 'init',
          user_id: profile?.id || '',
          target_intent: 'Initiation at the Sacred Hearth',
          actual_outcome: 'Began the Kith expedition.',
          duration_minutes: 0,
          rating_delta: 0,
          new_rating: 1200,
          feedback: 'Welcome to the Fellowship. Every journey begins with a first vow.',
          created_at: profile?.created_at || sessions[0]?.created_at || new Date().toISOString(),
        } as FocusSession,
      },
      ...sessions.map((s, idx) => ({
        index: idx + 1,
        rating: s.new_rating,
        session: s,
      })),
    ];
    return points;
  }, [sessions, profile]);

  const graphBounds = useMemo(() => {
    const ratings = chartData.map((d) => d.rating);
    const minVal = Math.min(1100, Math.min(...ratings) - 50);
    const maxVal = Math.max(1800, Math.max(...ratings) + 80);
    return { minVal, maxVal, range: maxVal - minVal };
  }, [chartData]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 40;
  const paddingRight = 130;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getSvgX = (index: number) => {
    if (chartData.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (chartData.length - 1)) * chartWidth;
  };

  const getSvgY = (rating: number) => {
    const normalized = (rating - graphBounds.minVal) / graphBounds.range;
    return paddingTop + chartHeight * (1 - Math.max(0, Math.min(1, normalized)));
  };

  // Build path string
  const polylinePoints = chartData
    .map((d) => `${getSvgX(d.index)},${getSvgY(d.rating)}`)
    .join(' ');

  // -------------------------------------------------------------
  // 2. GitHub-Style Contribution Heatmap (Past 18 Weeks / 126 Days)
  // -------------------------------------------------------------
  const heatmapData = useMemo(() => {
    const totalDays = 126; // 18 weeks * 7 days
    const today = new Date();
    const days: Array<{
      dateStr: string;
      displayDate: string;
      questCount: number;
      focusCount: number;
      totalScore: number;
      level: 0 | 1 | 2 | 3 | 4;
    }> = [];

    // Map quests by date
    const questMap: Record<string, number> = {};
    quests.forEach((q) => {
      if (q.is_completed) {
        const d = (q.completed_at || q.target_date || '').split('T')[0];
        if (d) questMap[d] = (questMap[d] || 0) + 1;
      }
    });

    // Map focus sessions by date
    const focusMap: Record<string, number> = {};
    sessions.forEach((s) => {
      const d = (s.created_at || '').split('T')[0];
      if (d) focusMap[d] = (focusMap[d] || 0) + 1;
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];

      const qCount = questMap[iso] || 0;
      const fCount = focusMap[iso] || 0;
      const score = qCount + fCount * 2;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (score >= 6) level = 4;
      else if (score >= 4) level = 3;
      else if (score >= 2) level = 2;
      else if (score >= 1) level = 1;

      days.push({
        dateStr: iso,
        displayDate: d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        questCount: qCount,
        focusCount: fCount,
        totalScore: score,
        level,
      });
    }

    // Split into 18 weeks of 7 days
    const weeks: typeof days[] = [];
    for (let w = 0; w < 18; w++) {
      weeks.push(days.slice(w * 7, w * 7 + 7));
    }
    return { days, weeks };
  }, [quests, sessions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Card */}
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: `${currentTier.color}20`, border: `1px solid ${currentTier.color}40` }}
          >
            <Award className="w-6 h-6" style={{ color: currentTier.color }} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Discipline Rating
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-stone-100 font-mono">{currentRating}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentTier.bgBadge} ${currentTier.accentBorder}`}
                style={{ color: currentTier.color }}
              >
                {currentTier.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Peak Rating Card */}
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Peak Attainment
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-amber-400 font-mono">{peakRating}</span>
              <span className="text-[10px] text-amber-400/80 font-semibold">{peakTier.tier}</span>
            </div>
          </div>
        </div>

        {/* Focus Hours Card */}
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-md">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Intentional Hours
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-stone-100 font-mono">{totalFocusHours}h</span>
              <span className="text-[11px] text-stone-500">({sessions.length} blocks)</span>
            </div>
          </div>
        </div>

        {/* Rituals Card */}
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Fulfilled Rituals
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-stone-100 font-mono">{totalCompletedQuests}</span>
              <span className="text-[11px] text-stone-500">habits kept</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Codeforces-Style Rating Graph */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4 relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-cinzel text-lg font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Discipline Progression Curve</span>
            </h3>
            <p className="text-xs text-stone-400">
              Codeforces-style tier milestones based on intentional focus block follow-through.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-stone-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Scout (&lt;1300)
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Pathfinder (1300)
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              Vanguard (1500)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Hearthkeeper (1700+)
            </span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative w-full overflow-x-auto select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            <defs>
              <linearGradient id="cfLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="75%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Shading below line */}
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Tier Bands (Codeforces-style colored background zones) */}
            {/* Hearthkeeper 1700+ */}
            <rect
              x={paddingLeft}
              y={getSvgY(Math.min(graphBounds.maxVal, 2200))}
              width={chartWidth}
              height={Math.max(0, getSvgY(1700) - getSvgY(Math.min(graphBounds.maxVal, 2200)))}
              fill="#f59e0b"
              fillOpacity="0.07"
            />
            {/* Vanguard 1500–1699 */}
            <rect
              x={paddingLeft}
              y={getSvgY(1700)}
              width={chartWidth}
              height={Math.max(0, getSvgY(1500) - getSvgY(1700))}
              fill="#6366f1"
              fillOpacity="0.06"
            />
            {/* Pathfinder 1300–1499 */}
            <rect
              x={paddingLeft}
              y={getSvgY(1500)}
              width={chartWidth}
              height={Math.max(0, getSvgY(1300) - getSvgY(1500))}
              fill="#10b981"
              fillOpacity="0.06"
            />
            {/* Scout < 1300 */}
            <rect
              x={paddingLeft}
              y={getSvgY(1300)}
              width={chartWidth}
              height={Math.max(0, getSvgY(graphBounds.minVal) - getSvgY(1300))}
              fill="#64748b"
              fillOpacity="0.05"
            />

            {/* Horizontal Reference Lines & Tier Labels */}
            {[1300, 1500, 1700].map((tierLine) => {
              const y = getSvgY(tierLine);
              const label =
                tierLine === 1700
                  ? 'Hearthkeeper (1700)'
                  : tierLine === 1500
                  ? 'Vanguard (1500)'
                  : 'Pathfinder (1300)';
              const strokeColor =
                tierLine === 1700 ? '#f59e0b40' : tierLine === 1500 ? '#6366f140' : '#10b98140';
              const textColor =
                tierLine === 1700 ? '#f59e0b' : tierLine === 1500 ? '#818cf8' : '#10b981';

              return (
                <g key={tierLine}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke={strokeColor}
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft + chartWidth + 10}
                    y={y + 3.5}
                    fill={textColor}
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Chart Area Fill */}
            {chartData.length > 1 && (
              <polygon
                points={`
                  ${getSvgX(0)},${getSvgY(graphBounds.minVal)}
                  ${polylinePoints}
                  ${getSvgX(chartData.length - 1)},${getSvgY(graphBounds.minVal)}
                `}
                fill="url(#areaGradient)"
              />
            )}

            {/* Main Polyline Curve */}
            <polyline
              fill="none"
              stroke="url(#cfLineGradient)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polylinePoints}
            />

            {/* Data Points (Interactive hover dots) */}
            {chartData.map((d) => {
              const x = getSvgX(d.index);
              const y = getSvgY(d.rating);
              const isHovered = hoveredPoint?.session.id === d.session.id;
              const pointTier = getRatingTier(d.rating);

              return (
                <g key={`${d.session.id}_${d.index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 4}
                    fill={pointTier.color}
                    stroke="#0c0a09"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-150 hover:scale-125"
                    onMouseEnter={() => setHoveredPoint({ x, y, session: d.session })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 p-3 rounded-xl bg-stone-950 border border-amber-500/40 shadow-2xl text-left w-64 text-xs animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(hoveredPoint.y / svgHeight) * 100}%`,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-stone-800">
                <span className="font-bold text-amber-400 text-[11px]">
                  Rating: {hoveredPoint.session.new_rating}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    hoveredPoint.session.rating_delta >= 0
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {hoveredPoint.session.rating_delta >= 0
                    ? `+${hoveredPoint.session.rating_delta}`
                    : hoveredPoint.session.rating_delta}
                </span>
              </div>
              <p className="text-[11px] text-stone-200 font-medium truncate mb-1">
                "{hoveredPoint.session.target_intent}"
              </p>
              {hoveredPoint.session.actual_outcome && (
                <p className="text-[10px] text-stone-400 line-clamp-2 italic mb-1">
                  Outcome: {hoveredPoint.session.actual_outcome}
                </p>
              )}
              <div className="text-[9px] text-stone-500 mt-1 flex justify-between">
                <span>{hoveredPoint.session.duration_minutes}m Sprint</span>
                <span>{new Date(hoveredPoint.session.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. GitHub-Style Contribution Heatmap */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-cinzel text-lg font-bold text-stone-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Fellowship Contribution Grid</span>
            </h3>
            <p className="text-xs text-stone-400">
              Daily completed habits and deep focus sprints over the past 18 weeks.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-stone-950 border border-stone-800" />
            <div className="w-3 h-3 rounded bg-amber-950/80 border border-amber-900/60" />
            <div className="w-3 h-3 rounded bg-amber-800 border border-amber-700" />
            <div className="w-3 h-3 rounded bg-amber-600 border border-amber-500" />
            <div className="w-3 h-3 rounded bg-amber-400 border border-amber-300" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2 select-none">
          <div className="inline-flex flex-col gap-1.5 min-w-[620px]">
            <div className="flex gap-1.5">
              {heatmapData.weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day) => {
                    const levelColors = [
                      'bg-stone-950 border-stone-850 hover:border-stone-600',
                      'bg-amber-950/70 border-amber-900/80 hover:border-amber-700',
                      'bg-amber-800/90 border-amber-700 hover:border-amber-500',
                      'bg-amber-600 border-amber-500 hover:border-amber-400',
                      'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]',
                    ];

                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() => setHoveredHeatmapDay(day)}
                        onMouseLeave={() => setHoveredHeatmapDay(null)}
                        className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-all duration-100 ${
                          levelColors[day.level]
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Tooltip Status Bar */}
        <div className="h-6 flex items-center text-xs text-stone-400">
          {hoveredHeatmapDay ? (
            <span className="animate-in fade-in">
              <strong className="text-amber-400">{hoveredHeatmapDay.totalScore} activities</strong> on{' '}
              {hoveredHeatmapDay.displayDate} ({hoveredHeatmapDay.questCount} quests,{' '}
              {hoveredHeatmapDay.focusCount} focus blocks)
            </span>
          ) : (
            <span className="text-stone-500 text-[11px] italic">
              Hover over squares to examine specific expedition checkpoints.
            </span>
          )}
        </div>
      </div>

      {/* 3. Recent Focus Sessions Log */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-lg font-bold text-stone-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <span>Recent Focus Sprints</span>
          </h3>
          {onStartFocus && (
            <button
              onClick={onStartFocus}
              className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 fill-stone-950" />
              <span>Ignite New Block</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.slice(-5).reverse().map((s) => {
            const tier = getRatingTier(s.new_rating);
            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-stone-700"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-200">
                      "{s.target_intent}"
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-400">
                      {s.duration_minutes}m
                    </span>
                  </div>

                  {s.actual_outcome && (
                    <p className="text-xs text-stone-400 line-clamp-1 italic">
                      Outcome: {s.actual_outcome}
                    </p>
                  )}

                  {s.feedback && (
                    <p className="text-[11px] text-amber-400/90 italic">
                      Mentor: "{s.feedback}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="font-mono text-sm font-bold text-stone-200">
                        {s.new_rating}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${tier.bgBadge} ${tier.accentBorder}`}
                        style={{ color: tier.color }}
                      >
                        {tier.tier}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      s.rating_delta >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {s.rating_delta >= 0 ? `+${s.rating_delta}` : s.rating_delta}
                  </span>
                </div>
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-10 px-4 border border-dashed border-stone-800 rounded-2xl bg-stone-950/30 space-y-2">
              <Compass className="w-8 h-8 text-stone-600 mx-auto" />
              <p className="text-xs text-stone-400 font-medium">
                No focus sprints logged yet.
              </p>
              <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                Ignite your first 25-minute intentional focus block to begin climbing the discipline rating ranks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
