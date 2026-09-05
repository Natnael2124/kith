import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Copy, Check, Send, RefreshCw } from 'lucide-react';
import { useCaravan } from '../../context/CaravanContext';
import { callAIChronicler, getStoredAISettings } from '../../lib/ai';

interface ChronicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChronicleModal: React.FC<ChronicleModalProps> = ({ isOpen, onClose }) => {
  const { caravan, logs, partyMembers, addCustomLog } = useCaravan();
  const [story, setStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inscribed, setInscribed] = useState(false);

  if (!isOpen) return null;

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setInscribed(false);
    try {
      const aiSettings = getStoredAISettings();
      const generated = await callAIChronicler(
        aiSettings,
        caravan?.name || 'The Caravan',
        caravan?.expedition_distance || 0,
        caravan?.campfire_level || 100,
        logs,
        partyMembers
      );
      setStory(generated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate story';
      setStory(`The Chronicler encountered a brief fog in the pass: ${message}. Using memory of the stars to guide the party.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!story) return;
    navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInscribeToFeed = async () => {
    if (!story) return;
    await addCustomLog('chronicle_story', story);
    setInscribed(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
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
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <span>The AI Chronicler</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                BYOK AI
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Synthesizes your caravan's habits, kindling notes, and milestones into an evocative adventure story.
            </p>
          </div>
        </div>

        {/* Story Box */}
        <div className="flex-1 overflow-y-auto bg-stone-950/80 border border-stone-800 rounded-xl p-5 mb-4 font-serif text-sm leading-relaxed text-stone-300 space-y-4 shadow-inner">
          {story ? (
            story.split('\n\n').map((para, i) => (
              <p key={i} className="first-letter:text-2xl first-letter:font-bold first-letter:text-amber-400 first-letter:mr-1">
                {para}
              </p>
            ))
          ) : (
            <div className="text-center py-12 text-stone-500 font-sans">
              <Sparkles className="w-8 h-8 mx-auto text-purple-400/50 mb-2 animate-pulse" />
              <p className="text-sm font-medium text-stone-400">The Chronicler awaits your signal.</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Press "Weave Expedition Story" to transcribe your party's deeds and campfire moments.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800/80">
          <div className="text-xs text-stone-500">
            {story ? 'Story woven from recent expedition logs' : 'Deterministic fallback or BYOK key supported'}
          </div>

          <div className="flex items-center gap-2">
            {story && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleInscribeToFeed}
                  disabled={inscribed}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {inscribed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{inscribed ? 'Inscribed to Feed!' : 'Post to Caravan Feed'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Weaving Lore...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{story ? 'Re-weave Story' : 'Weave Expedition Story'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
