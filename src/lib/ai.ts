import { AISettings, CaravanLog, FocusEvaluationResult, Profile, QuestCategory, AIProvider } from '../types';

const AI_STORAGE_KEY = 'kith_ai_settings';

export function getStoredAISettings(): AISettings {
  const saved = localStorage.getItem(AI_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Migrate deprecated gemini-1.5 models to gemini-2.5-flash
      if (parsed.model && parsed.model.includes('1.5')) {
        parsed.model = 'gemini-2.5-flash';
      }
      return parsed;
    } catch {
      // ignore
    }
  }
  return {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
  };
}

export function saveStoredAISettings(settings: AISettings) {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(settings));
}

// Procedural Chronicle Generator (Atmospheric fallback when no key is set)
export function generateProceduralChronicle(
  caravanName: string,
  distance: number,
  campfireLevel: number,
  recentLogs: CaravanLog[],
  members: Profile[]
): string {
  const landscapes = [
    'the misty vales of Whispering Pines',
    'the sun-drenched plateau of Amber Ridge',
    'the quiet crossing of Moonlit Ford',
    'the ancient evergreen corridor of the Northward Pass',
    'the starlit foothills of Mount Solace',
  ];
  const landscape = landscapes[Math.floor(Math.random() * landscapes.length)];

  const restingMembers = members.filter((m) => m.is_resting).map((m) => m.username);
  const restingClause =
    restingMembers.length > 0
      ? ` By the warmth of the hearth rested ${restingMembers.join(', ')}, blanketed in quiet peace while companions kept vigilant watch.`
      : '';

  const completedQuests = recentLogs
    .filter((l) => l.entry_type === 'quest_done')
    .slice(0, 3)
    .map((l) => l.message.replace(/fed the campfire seasoned birch.*with:\s*"/, '').replace(/"$/, ''));

  const questClause =
    completedQuests.length > 0
      ? ` Provisions were hauled and paths cleared through daily discipline: ${completedQuests.slice(0, 2).join(' and ')}.`
      : ' Quiet strides were made along the forest trail as the party kept steady rhythm.';

  const fireAtmosphere =
    campfireLevel > 70
      ? `The campfire roared with brilliant golden embers, throwing a protective circle of warmth thirty paces into the gathering dark.`
      : campfireLevel > 40
      ? `A steady, comforting amber glow curled from the hearthstones, sheltering the party against the night chill.`
      : `The embers burned low and gentle, urging the companions to gather close and kindle each other's spirits for the dawn.`;

  return `The ${caravanName} pressed through ${landscape}, marking ${distance} leagues traversed upon the ancient chart. ${questClause}${restingClause}

${fireAtmosphere} As twilight deepened into a sky of scattered diamonds, laughter and quiet shared tales drifted into the canopy. The road ahead may bend into shadow, but tonight, the fire holds true.`;
}

// Procedural Quest Alchemist (Fallback when no key is configured)
export function generateProceduralQuests(goal: string): Array<{
  title: string;
  category: QuestCategory;
  xp_value: number;
  campfire_value: number;
}> {
  const lower = goal.toLowerCase();

  if (lower.includes('run') || lower.includes('marathon') || lower.includes('fit') || lower.includes('health')) {
    return [
      { title: 'Morning 25-minute zone-2 jog or brisk walk', category: 'Vitality', xp_value: 30, campfire_value: 20 },
      { title: 'Log hydration & nutritious recovery meal', category: 'Vitality', xp_value: 20, campfire_value: 15 },
      { title: 'Read 1 running strategy or mobility article', category: 'Intellect', xp_value: 25, campfire_value: 15 },
      { title: '10-minute post-run stretching & breathing', category: 'Clarity', xp_value: 20, campfire_value: 10 },
      { title: 'Prep gear & running shoes by the door for tomorrow', category: 'Craft', xp_value: 25, campfire_value: 15 },
    ];
  }

  if (lower.includes('learn') || lower.includes('study') || lower.includes('code') || lower.includes('read') || lower.includes('language')) {
    return [
      { title: `30 minutes undistracted focus on ${goal}`, category: 'Intellect', xp_value: 35, campfire_value: 20 },
      { title: 'Take handwritten synthesis notes of key concepts', category: 'Craft', xp_value: 25, campfire_value: 15 },
      { title: 'Eye rest & 15-minute screen-free walk', category: 'Vitality', xp_value: 20, campfire_value: 15 },
      { title: 'Review flashcards or practice exercises', category: 'Intellect', xp_value: 25, campfire_value: 15 },
      { title: 'Evening reflection: what clicked today?', category: 'Clarity', xp_value: 20, campfire_value: 10 },
    ];
  }

  // Default balanced questline
  return [
    { title: `Dedicate 25 minutes of deep craft toward: ${goal.slice(0, 45)}`, category: 'Craft', xp_value: 30, campfire_value: 20 },
    { title: 'Study or research one critical step forward', category: 'Intellect', xp_value: 25, campfire_value: 15 },
    { title: 'Take a restorative 20-minute movement break', category: 'Vitality', xp_value: 20, campfire_value: 15 },
    { title: 'Mindful checkpoint: Clear workspace and breathe', category: 'Clarity', xp_value: 20, campfire_value: 15 },
  ];
}

// Call AI Provider
export async function callAIChronicler(
  settings: AISettings,
  caravanName: string,
  distance: number,
  campfireLevel: number,
  recentLogs: CaravanLog[],
  members: Profile[]
): Promise<string> {
  if (!settings.apiKey) {
    return generateProceduralChronicle(caravanName, distance, campfireLevel, recentLogs, members);
  }

  const prompt = `You are the legendary AI Chronicler of the fantasy cooperative fellowship "${caravanName}".
The caravan travels together in mutual support without competition.
Expedition distance: ${distance} leagues.
Campfire Flame level: ${campfireLevel}% (100% is a roaring bonfire, 0% is smoldering ash).
Members: ${members.map((m) => `${m.username} (${m.archetype}${m.is_resting ? ', resting peacefully at the hearth' : ''})`).join(', ')}.
Recent deeds & events:
${recentLogs.slice(0, 8).map((l) => `- ${l.author_name || 'A companion'}: ${l.message}`).join('\n')}

Write an evocative, atmospheric, and heartwarming journal entry (2 to 3 paragraphs) chronicling this chapter of their journey.
Emphasize fellowship, how their habits warm the shared hearth, and the gentle beauty of moving forward together.
Do not use bullet points or titles; write it like a cozy fantasy adventure chronicle.`;

  return await requestAI(settings, prompt);
}

// 1. Goal Breakdown Routine (Parses high-level goals into 3–5 bite-sized daily quests)
export async function breakdownGoal(
  goalText: string,
  apiKey?: string,
  provider?: AIProvider,
  model?: string,
  customEndpoint?: string
): Promise<Array<{
  title: string;
  category: QuestCategory;
  xp_value: number;
  campfire_value: number;
}>> {
  const stored = getStoredAISettings();
  const effectiveSettings: AISettings = {
    apiKey: (apiKey ?? stored.apiKey).trim(),
    provider: provider ?? stored.provider ?? 'gemini',
    model: (model ?? stored.model)?.trim(),
    customEndpoint: (customEndpoint ?? stored.customEndpoint)?.trim(),
  };

  if (!effectiveSettings.apiKey && effectiveSettings.provider !== 'custom') {
    return generateProceduralQuests(goalText);
  }

  const prompt = `You are the AI Quest Alchemist in the cooperative life-gamification app "Kith".
The companion has pledged this goal: "${goalText}".
Break this down into 3 to 5 bite-sized, actionable daily habits.
Assign each habit to one of the four sacred pillars:
- "Intellect": study, deliberate focus, reading, deep work
- "Vitality": physical movement, nutrition, rest, outdoor energy
- "Clarity": mindfulness, emotional balance, reflection, decluttering
- "Craft": creative execution, making, building, hands-on practice

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "title": "Clear concise habit title (max 60 chars)",
    "category": "Intellect" | "Vitality" | "Clarity" | "Craft",
    "xp_value": integer between 20 and 35,
    "campfire_value": integer between 15 and 25
  }
]
Do not include markdown codeblocks or extra text.`;

  try {
    const raw = await requestAI(effectiveSettings, prompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 5).map((item) => ({
        title: String(item.title || 'Daily practice').slice(0, 80),
        category: ['Intellect', 'Vitality', 'Clarity', 'Craft'].includes(item.category)
          ? item.category
          : 'Intellect',
        xp_value: Math.max(15, Math.min(50, Number(item.xp_value) || 25)),
        campfire_value: Math.max(10, Math.min(30, Number(item.campfire_value) || 15)),
      }));
    }
  } catch (err) {
    console.warn('AI breakdown failed, falling back to procedural quests:', err);
  }

  return generateProceduralQuests(goalText);
}

// Backwards compatibility alias for QuestAlchemistModal
export async function callAIQuestAlchemist(
  settings: AISettings,
  goal: string
): Promise<Array<{
  title: string;
  category: QuestCategory;
  xp_value: number;
  campfire_value: number;
}>> {
  return breakdownGoal(goal, settings.apiKey, settings.provider, settings.model, settings.customEndpoint);
}

// 2. Focus Session Follow-Through Arbiter (Evaluates output quality & returns rating_delta + feedback)
export async function evaluateFocusSession(
  session: {
    target: string;
    outcome: string | null;
    durationMinutes: number;
  },
  apiKey?: string,
  provider?: AIProvider,
  model?: string,
  customEndpoint?: string
): Promise<FocusEvaluationResult> {
  const stored = getStoredAISettings();
  const effectiveSettings: AISettings = {
    apiKey: (apiKey ?? stored.apiKey).trim(),
    provider: provider ?? stored.provider ?? 'gemini',
    model: (model ?? stored.model)?.trim(),
    customEndpoint: (customEndpoint ?? stored.customEndpoint)?.trim(),
  };

  const outcomeTrimmed = (session.outcome || '').trim();

  // Automatic heuristic fallback if no key or custom endpoint
  const evaluateHeuristic = (): FocusEvaluationResult => {
    if (!outcomeTrimmed || outcomeTrimmed.toLowerCase() === 'skipped' || outcomeTrimmed.toLowerCase() === 'none') {
      return {
        rating_delta: 0,
        feedback: 'A quiet rest on the trail. The campfire remains steady while you regroup for your next expedition.',
      };
    }

    if (outcomeTrimmed.length < 15) {
      return {
        rating_delta: 15,
        feedback: 'Modest progress logged. Steady small strides keep the caravan moving forward.',
      };
    }

    if (outcomeTrimmed.length >= 80 && session.durationMinutes >= 25) {
      return {
        rating_delta: 28,
        feedback: 'Exceptional follow-through! You honored your focus vow with precision and added radiant light to the hearth.',
      };
    }

    return {
      rating_delta: 20,
      feedback: 'Honorable dedication to your intent. Your deliberate focus keeps our companions inspired.',
    };
  };

  if (!effectiveSettings.apiKey && effectiveSettings.provider !== 'custom') {
    return evaluateHeuristic();
  }

  const prompt = `You are the wise Arbiter of Discipline and companion mentor in the life-gamification app "Kith".
A companion just completed an intentional focus block.
- Focus Duration: ${session.durationMinutes} minutes
- Pre-Session Intent: "${session.target}"
- Logged Outcome: "${outcomeTrimmed || '(No outcome reported)'}"

Evaluate the companion's follow-through, honesty, and output quality.
Return ONLY valid JSON with this exact schema:
{
  "rating_delta": integer between -15 and 35,
  "feedback": "1 to 2 concise, honest sentences in cozy companion voice"
}

Scoring rules for rating_delta:
- +26 to +35: Outstanding execution, exceeded or thoroughly fulfilled the vow.
- +18 to +25: Solid, honest completion of the stated intent.
- +5 to +17: Partial completion, faced friction but still made progress.
- 0: Skipped or minimal effort logged.
- -5 to -15: Completely deserted the intent or logged frivolous distraction.
Do not wrap in markdown tags or add explanations.`;

  try {
    const raw = await requestAI(effectiveSettings, prompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.rating_delta === 'number') {
      const delta = Math.max(-15, Math.min(35, Math.round(parsed.rating_delta)));
      const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : 'Your focus adds vital warmth to the caravan embers.';
      return { rating_delta: delta, feedback };
    }
  } catch (err) {
    console.warn('AI evaluation error, falling back to heuristic:', err);
  }

  return evaluateHeuristic();
}

async function requestAI(settings: AISettings, prompt: string): Promise<string> {
  const { provider, apiKey, model, customEndpoint } = settings;

  if (provider === 'gemini') {
    const targetModel = model?.trim() || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Gemini API error (${res.status}): ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'openai') {
    const targetModel = model?.trim() || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API error (${res.status}): ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'claude') {
    const targetModel = model?.trim() || 'claude-3-5-sonnet-latest';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Claude API error (${res.status}): ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  if (provider === 'custom') {
    const endpoint = customEndpoint?.trim() || 'http://localhost:11434/v1/chat/completions';
    const targetModel = model?.trim() || 'default';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey?.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Custom AI error (${res.status}): ${errData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || data.response || '';
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}
