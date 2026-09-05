import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Compass,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { sound } from '../../lib/sound';
import { evaluateFocusSession, getStoredAISettings } from '../../lib/ai';
import { recordFocusSession, getRatingTier } from '../../lib/focusStorage';
import { FocusSession } from '../../types';

interface FocusTimerProps {
  onSessionComplete?: (session: FocusSession) => void;
  onNavigateJourney?: () => void;
}

type TimerStage = 'setup' | 'running' | 'reflection' | 'calibrating' | 'result';

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  onNavigateJourney,
}) => {
  const { profile, updateProfile } = useAuth();

  // Stage & Setup
  const [stage, setStage] = useState<TimerStage>('setup');
  const [targetIntent, setTargetIntent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<25 | 50>(25);

  // Running Timer
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(sound.isCampfireActive());

  // Post-Session Reflection
  const [actualOutcome, setActualOutcome] = useState('');

  // Calibration Result
  const [evaluation, setEvaluation] = useState<{
    previousRating: number;
    newRating: number;
    delta: number;
    feedback: string;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync initial seconds when duration toggles in setup
  useEffect(() => {
    if (stage === 'setup') {
      setSecondsRemaining(durationMinutes * 60);
    }
  }, [durationMinutes, stage]);

  // Timer Tick
  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            sound.playQuestComplete();
            setStage('reflection');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsRemaining]);

  // Clean up ambient audio on unmount if playing
  useEffect(() => {
    return () => {
      if (sound.isCampfireActive()) {
        sound.stopCampfire();
      }
    };
  }, []);

  const toggleAmbient = () => {
    const active = sound.toggleCampfireAmbience();
    setAmbientAudio(active);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIntent.trim()) return;
    setSecondsRemaining(durationMinutes * 60);
    setIsRunning(true);
    setStage('running');
  };

  const handlePauseResume = () => {
    setIsRunning((prev) => !prev);
  };

  const handleEarlyFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setStage('reflection');
  };

  const handleAbandon = () => {
    if (confirm('Are you sure you want to abandon this focus block? The campfire will gently rest.')) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      if (ambientAudio) sound.stopCampfire();
      setAmbientAudio(false);
      setTargetIntent('');
      setStage('setup');
      setSecondsRemaining(durationMinutes * 60);
    }
  };

  const handleCalibrate = async (isSkipped: boolean = false) => {
    if (!profile) return;
    setStage('calibrating');

    const outcomeText = isSkipped ? 'Skipped' : actualOutcome.trim();
    const settings = getStoredAISettings();

    try {
      const evalResult = await evaluateFocusSession(
        {
          target: targetIntent.trim(),
          outcome: outcomeText,
          durationMinutes,
        },
        settings.apiKey,
        settings.provider,
        settings.model,
        settings.customEndpoint
      );

      const oldRating = profile.rating ?? 1200;
      const { session, newRating, newPeakRating } = await recordFocusSession(profile, {
        target: targetIntent.trim(),
        outcome: outcomeText,
        durationMinutes,
        ratingDelta: evalResult.rating_delta,
        feedback: evalResult.feedback,
      });

      // Update local profile state
      await updateProfile({
        rating: newRating,
        peak_rating: newPeakRating,
      });

      setEvaluation({
        previousRating: oldRating,
        newRating,
        delta: evalResult.rating_delta,
        feedback: evalResult.feedback,
      });

      if (evalResult.rating_delta > 0) {
        sound.playQuestComplete();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#6366f1'],
        });
      }

      if (onSessionComplete) onSessionComplete(session);
      setStage('result');
    } catch (err) {
      console.error('Calibration error:', err);
      // Fallback result on unexpected failure
      const fallbackRating = Math.max(100, (profile.rating ?? 1200) + 15);
      setEvaluation({
        previousRating: profile.rating ?? 1200,
        newRating: fallbackRating,
        delta: 15,
        feedback: 'Your effort has been registered. The path onward is forged step by step.',
      });
      setStage('result');
    }
  };

  const handleResetForNew = () => {
    setTargetIntent('');
    setActualOutcome('');
    setEvaluation(null);
    setStage('setup');
    setSecondsRemaining(durationMinutes * 60);
  };

  // Time calculations
  const totalSeconds = durationMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const currentTier = getRatingTier(profile?.rating ?? 1200);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Stage 1: Pre-Session Intent Setup */}
      {stage === 'setup' && (
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Subtle amber background gradient */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
                  <Flame className="w-7 h-7 fill-stone-950" />
                </div>
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-stone-100 flex items-center gap-2">
                    <span>Intentional Focus Block</span>
                  </h2>
                  <p className="text-xs text-stone-400">
                    Deep craft calibrated by deliberate practice and peer review.
                  </p>
                </div>
              </div>

              {/* Current Rating Pill */}
              <div
                className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${currentTier.bgBadge} ${currentTier.accentBorder}`}
              >
                <Award className="w-4 h-4" style={{ color: currentTier.color }} />
                <span className="text-xs font-bold" style={{ color: currentTier.color }}>
                  {currentTier.tier} • {profile?.rating ?? 1200}
                </span>
              </div>
            </div>

            <form onSubmit={handleStart} className="space-y-6">
              {/* Duration selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Select Focus Duration:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDurationMinutes(25)}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      durationMinutes === 25
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-stone-950/40 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>25 Minutes (Standard Sprint)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationMinutes(50)}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      durationMinutes === 50
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-stone-950/40 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>50 Minutes (Deep Expedition)</span>
                  </button>
                </div>
              </div>

              {/* The Intent Sentence Prompt */}
              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                  Pre-Session Vow / Intent:{' '}
                  <span className="text-amber-400 font-normal">
                    (What will you accomplish in these {durationMinutes} minutes?)
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={targetIntent}
                  onChange={(e) => setTargetIntent(e.target.value)}
                  placeholder="e.g., Draft the schema architecture and implement the core evaluateFocusSession routine with zero errors."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-2xl p-4 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none transition shadow-inner leading-relaxed"
                />
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Clarity is power. Stating your exact outcome prevents quiet distractions before they start.
                </p>
              </div>

              {/* Ambient Audio Switch */}
              <div className="flex items-center justify-between p-3.5 bg-stone-950/50 border border-stone-800 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  {ambientAudio ? (
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-stone-500" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-stone-200 block">
                      Campfire Ambience (Procedural Crackle)
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Gentle, synthesized white noise generated in real time
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleAmbient}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                    ambientAudio
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  {ambientAudio ? 'Playing' : 'Muted'}
                </button>
              </div>

              {/* Submit Start */}
              <button
                type="submit"
                disabled={!targetIntent.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <Play className="w-4 h-4 fill-stone-950 group-hover:scale-110 transition-transform" />
                <span>Ignite Focus Block ({durationMinutes}m)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stage 2: The Run (Active Countdown) */}
      {stage === 'running' && (
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 sm:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center">
          {/* Ambient radial glow pulsating */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
              isRunning ? 'bg-amber-500/15 opacity-100 animate-pulse' : 'bg-stone-800/20 opacity-40'
            }`}
          />

          {/* Active Intent Banner */}
          <div className="relative z-10 max-w-xl w-full mb-8 bg-stone-950/70 border border-stone-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
              Active Focus Vow
            </span>
            <p className="text-stone-200 text-sm font-medium italic leading-relaxed">
              "{targetIntent}"
            </p>
          </div>

          {/* Circular SVG Timer Ring */}
          <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                className="text-stone-950"
                strokeWidth="5"
              />
              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 * (1 - progressRatio)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer digits overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-stone-100 drop-shadow-md">
                {formattedTime}
              </span>
              <span className="text-xs text-stone-400 font-medium mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                {isRunning ? 'In Steady Flight' : 'Paused by Campfire'}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-8 w-full max-w-md">
            <button
              onClick={handlePauseResume}
              className={`flex-1 py-3 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                isRunning
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-stone-950" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleEarlyFinish}
              className="py-3 px-5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
              title="Conclude early and calibrate outcome"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Conclude & Reflect</span>
            </button>

            <button
              onClick={toggleAmbient}
              className={`p-3 rounded-2xl border text-xs transition ${
                ambientAudio
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
              title="Toggle Web Audio Campfire Ambience"
            >
              {ambientAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleAbandon}
              className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-stone-500 hover:text-rose-400 hover:border-rose-500/30 text-xs transition"
              title="Abandon Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 3: Post-Session Reflection */}
      {stage === 'reflection' && (
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden space-y-6">
          <div className="border-b border-stone-800/80 pb-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Session Completed
            </span>
            <h3 className="font-cinzel text-xl font-bold text-stone-100">
              Post-Session Reflection
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Review your progress against your initial vow. Honesty strengthens the bond between companions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 text-xs space-y-1">
            <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
              Initial Vow:
            </span>
            <p className="text-stone-200 italic font-medium">"{targetIntent}"</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-200 mb-1.5">
              What did you actually get done?
            </label>
            <textarea
              rows={4}
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              placeholder="e.g., Completed the schema updates and wrote the TypeScript interfaces. Got stuck on an audio glitch for 5 minutes but resolved it."
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-2xl p-4 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none transition shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleCalibrate(true)}
              className="px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs transition"
            >
              Skip Reflection (0 Rating Shift)
            </button>

            <button
              type="button"
              onClick={() => handleCalibrate(false)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>Evaluate & Calibrate Rating</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 4: Calibrating (Evaluating) */}
      {stage === 'calibrating' && (
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-12 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-stone-100">
            Attuning With the Arbiter...
          </h3>
          <p className="text-xs text-stone-400 max-w-sm">
            Evaluating follow-through, depth of craft, and calibrating your rating tier.
          </p>
        </div>
      )}

      {/* Stage 5: Rating Shift Reveal */}
      {stage === 'result' && evaluation && (
        <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-xl shadow-amber-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block mb-1">
              Focus Calibration Complete
            </span>
            <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
              Rating Calibration
            </h3>
          </div>

          {/* Animated Rating Counter Display */}
          <div className="p-6 rounded-3xl bg-stone-950/80 border border-stone-800 max-w-md mx-auto space-y-3 shadow-inner">
            <div className="flex items-center justify-center gap-4 text-2xl sm:text-3xl font-mono font-bold">
              <span className="text-stone-400">{evaluation.previousRating}</span>
              <ArrowRight className="w-6 h-6 text-stone-600 shrink-0" />
              <span className="text-amber-400">{evaluation.newRating}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  evaluation.delta >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {evaluation.delta >= 0 ? `+${evaluation.delta}` : evaluation.delta} Rating Points
              </span>

              {(() => {
                const tier = getRatingTier(evaluation.newRating);
                return (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${tier.bgBadge} ${tier.accentBorder}`}
                    style={{ color: tier.color }}
                  >
                    {tier.tier} Tier
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Mentor Feedback Appraisal */}
          <div className="p-5 rounded-2xl bg-stone-950/50 border border-stone-800/80 max-w-lg mx-auto text-left">
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Arbiter's Counsel:</span>
            </div>
            <p className="text-stone-300 text-xs italic leading-relaxed">
              "{evaluation.feedback}"
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetForNew}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Embark on Another Block</span>
            </button>

            {onNavigateJourney && (
              <button
                onClick={onNavigateJourney}
                className="py-3 px-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>View Rating Curve & Heatmap</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
