import { AISettings, CaravanLog, Profile, QuestCategory } from '../types';

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

export async function callAIQuestAlchemist(
  settings: AISettings,
  goal: string
): Promise<Array<{
  title: string;
  category: QuestCategory;
  xp_value: number;
  campfire_value: number;
}>> {
  if (!settings.apiKey) {
    return generateProceduralQuests(goal);
  }

  const prompt = `You are the AI Quest Alchemist in the life-gamification app "Kith".
The user has set this real-life goal: "${goal}".
Break down this goal into 4 to 5 balanced, actionable daily quests.
Categorize each quest into one of the four sacred pillars:
- "Intellect": study, deliberate focus, reading, analysis
- "Vitality": physical movement, nutrition, rest, outdoor energy
- "Clarity": mindfulness, emotional balance, reflection, decluttering
- "Craft": creative work, making, building, hands-on practice

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "title": "Clear concise habit title",
    "category": "Intellect" | "Vitality" | "Clarity" | "Craft",
    "xp_value": 20 to 35,
    "campfire_value": 15 to 25
  }
]
Do not include markdown codeblocks or extra text.`;

  try {
    const raw = await requestAI(settings, prompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        title: item.title || 'Daily practice',
        category: ['Intellect', 'Vitality', 'Clarity', 'Craft'].includes(item.category)
          ? item.category
          : 'Intellect',
        xp_value: Number(item.xp_value) || 25,
        campfire_value: Number(item.campfire_value) || 15,
      }));
    }
  } catch (err) {
    console.warn('Failed to parse AI response, falling back to procedural quests:', err);
  }

  return generateProceduralQuests(goal);
}

async function requestAI(settings: AISettings, prompt: string): Promise<string> {
  const { provider, apiKey } = settings;

  if (provider === 'gemini') {
    const model = settings.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
    const model = settings.model || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
    const model = settings.model || 'claude-3-5-sonnet-latest';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model,
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

  throw new Error(`Unsupported AI provider: ${provider}`);
}
