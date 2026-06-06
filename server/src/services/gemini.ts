import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GeminiOutput,
  stripMarkdownFences,
  validatePlanOutput,
} from "../lib/validate";

// ── Error types ────────────────────────────────────────────────────────────

export class AIInvalidOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIInvalidOutputError";
  }
}

export class AIUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIUnavailableError";
  }
}

// ── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Hobyay's curriculum designer. Given a hobby and a learner's goal/proficiency level, produce a focused learning plan of 5 to 8 techniques.

First, categorize the hobby into one of these categories:
- "music": playing musical instruments, singing, reading music.
- "strategy": board games (chess, go), tactical games, card games, logical puzzles.
- "arts": drawing, painting, origami, calligraphy, sculpture.
- "fitness": workout exercises, bouldering, martial arts, yoga, running, sports drills.
- "culinary": baking, cooking, sourdough, brewing, cocktail making.
- "general": any other hobby (e.g., coding, writing, gardening, language learning).

Rules:
1. Choose techniques a real instructor would prioritize. Order them so that earlier techniques are prerequisites or foundations for later ones (order = 1 is learned first).
2. Calibrate to the goal level:
   - "beginner": target core foundations and prerequisites first, 5-6 techniques.
   - "intermediate": target solid core + intermediate techniques, 6-7 techniques.
   - "advanced": target advanced techniques and deliberate practice drills, 7-8 techniques.
3. Each technique must be a concrete, practicable skill ("Flagging"), never a vague theme ("Get better at climbing").
4. "description": 2-3 plain-language sentences explaining what the technique is and how to practice it. No jargon without explanation.
5. "whyItMatters": one motivating sentence.
6. "searchQuery": the exact YouTube search string most likely to find a high-quality tutorial for this technique at this level. Include the hobby name and the word "tutorial" or "technique".
7. "summary": one sentence framing the whole plan for this learner.
8. "quiz": A simple conceptual question to verify the learner understands this technique. Include a "question" (string), an array of exactly 4 multiple-choice "options" (strings), the "correctIndex" (number, 0-3), and a brief "explanation" (string) of why it's correct.
9. "flashcards": An array of exactly 2 flashcards. Each flashcard must have a "front" (a question or concept key term to recall) and a "back" (a brief explanation, definition, or answer).
10. "category": Identify the hobby category ("music", "strategy", "arts", "fitness", "culinary", "general").
11. "practiceTool": For each technique, provide a practice tool configuration suited for that category:
    - If music: Include "bpm" (integer e.g., 60-120), "timeSignature" (string, e.g. "4/4"), "pattern" (strumming or playing pattern, e.g. "Down-Down-Up-Up-Down-Up"), "chords" (array of strings, e.g., ["C", "G", "Am", "F"]).
    - If strategy: Include "boardType" ("chess" or "grid"), "setup" (e.g. FEN string for chess, or coordinates layout, e.g., "White: Ke1, Qf3; Black: Ke8, Pa7"), "puzzlePrompt" (e.g. "Find the winning move" or "Find the coordinates d5, e6"), "solution" (array of correct moves or squares to tap, e.g., ["f3", "f7"]).
    - If arts: Include "gridSize" ("3x3", "4x4", or "5x5"), "subjectStyle" (e.g. "still life", "portrait"), "aspectRatio" ("1:1", "4:3", or "16:9"), "referenceImagePrompt" (detailed description of subject to draw), "timerSeconds" (number e.g., 60-300).
    - If fitness: Include "intervals" (array of exactly 3 stages: Prep/Prepare, Active/Work, Rest/Recover, e.g., [{"name": "Prepare", "duration": 10}, {"name": "Work", "duration": 45}, {"name": "Recover", "duration": 15}]), "cycles" (number e.g. 4), "instruction" (one key form/posture check).
    - If culinary: Include "steps" (array of { name: string, duration: number in seconds, sensoryCheck: string } describing the steps/timers, e.g. Autolyse, Bulk rise, Baking), "targetTemperature" (optional, e.g. "220C").
    - If general: Include "focusTime" (seconds, e.g., 600), "milestones" (array of strings of active practice steps, e.g., ["1. Read documentation", "2. Scaffold project", "3. Test edge cases"]), "reflectionQuestions" (array of 2 reflection questions, e.g. "What was the trickiest part?", "How can you improve next time?").
12. If the input is not a learnable hobby or skill (e.g. gibberish, a request for something else), return {"error": "NOT_A_HOBBY"}.

Respond with ONLY valid JSON matching exactly this shape, no markdown, no commentary:

{
  "category": "music" | "strategy" | "arts" | "fitness" | "culinary" | "general",
  "summary": string,
  "techniques": [
    {
      "name": string,
      "description": string,
      "whyItMatters": string,
      "order": number,
      "searchQuery": string,
      "quiz": {
        "question": string,
        "options": [string, string, string, string],
        "correctIndex": number,
        "explanation": string
      },
      "flashcards": [
        { "front": string, "back": string },
        { "front": string, "back": string }
      ],
      "practiceTool": {
        // Fields populated based on the category rules above
      }
    }
  ]
}`;

// ── Service ────────────────────────────────────────────────────────────────

function getModel(modelName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIUnavailableError("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
}

export interface UserProfile {
  roles: string[];
  goals: string[];
  interests: string[];
  learningPreferences: string[];
}

/**
 * Generate a learning plan for the given hobby and goal level.
 * Returns a validated GeminiOutput (either a plan or NOT_A_HOBBY error).
 *
 * Tries fallback models in sequence if the primary model fails.
 */
export async function generatePlan(
  hobby: string,
  level: string,
  profile?: UserProfile | null,
): Promise<GeminiOutput> {
  const modelsToTry = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  let userMessage = `Hobby: ${hobby}\nGoal level: ${level}`;
  if (profile) {
    if (profile.roles && profile.roles.length > 0) {
      userMessage += `\nUser's Role/Expertise: ${profile.roles.join(", ")}`;
      userMessage += `\nInstruction: We will use examples, explanations, and analogies that are relevant to user's role and expertise when helpful (e.g. if developer/engineer, design patterns, logical constructs or algorithms; if designer/creative, visual compositions, hierarchy or alignments; if product manager, roadmap prioritization or iterative feedback loops; etc.). Make sure to apply these subtle hints when explaining the techniques and why they matter.`;
    }
    if (profile.goals && profile.goals.length > 0) {
      userMessage += `\nUser's Learning Goals: ${profile.goals.join(", ")}`;
      userMessage += `\nInstruction: Target the plan's details and motivational summaries to help them achieve these goals (e.g. if 'boost my career', show practical utility in professional settings; if 'just for fun', keep descriptions approachable, light and engaging; if 'make better use of my time', focus on high-efficiency techniques).`;
    }
    if (profile.interests && profile.interests.length > 0) {
      userMessage += `\nUser's Other Interests: ${profile.interests.join(", ")}`;
    }
    if (profile.learningPreferences && profile.learningPreferences.length > 0) {
      userMessage += `\nUser's Learning Preferences: ${profile.learningPreferences.join(", ")}`;
      userMessage += `\nInstruction: Structure the plan or describe the techniques to emphasize their preferences (e.g., highlighting step-by-step clear learning paths or focusing on hands-on practical exercises/descriptions).`;
    }
  }

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(
        `[Gemini] Attempting plan generation with model: ${modelName}`,
      );
      const model = getModel(modelName);
      let responseText: string;

      try {
        const result = await model.generateContent(userMessage);
        responseText = result.response.text();
      } catch (err) {
        throw new AIUnavailableError(
          `Gemini API call failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // First attempt: parse and validate
      const cleaned = stripMarkdownFences(responseText);

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // JSON parse failed — retry
        return await retryWithFeedback(
          model,
          userMessage,
          `Output was not valid JSON: ${cleaned.slice(0, 200)}`,
        );
      }

      try {
        return validatePlanOutput(parsed);
      } catch (validationError) {
        const issues =
          validationError instanceof Error
            ? validationError.message
            : String(validationError);
        return await retryWithFeedback(model, userMessage, issues);
      }
    } catch (err) {
      console.warn(
        `[Gemini] Model ${modelName} failed or returned invalid output:`,
        err instanceof Error ? err.message : String(err),
      );
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw new AIUnavailableError(
    `All Gemini fallback models exhausted. Last error: ${lastError ? lastError.message : "Unknown error"}`,
  );
}

async function retryWithFeedback(
  model: ReturnType<typeof getModel>,
  originalMessage: string,
  issues: string,
): Promise<GeminiOutput> {
  const retryPrompt = `Your previous output failed validation: ${issues}. Return corrected JSON only.`;

  let responseText: string;
  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: originalMessage }] },
        {
          role: "model",
          parts: [{ text: '{"error": "retrying"}' }],
        },
      ],
    });
    const result = await chat.sendMessage(retryPrompt);
    responseText = result.response.text();
  } catch (err) {
    throw new AIUnavailableError(
      `Gemini retry failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const cleaned = stripMarkdownFences(responseText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AIInvalidOutputError(
      `Gemini output is not valid JSON after retry: ${cleaned.slice(0, 200)}`,
    );
  }

  try {
    return validatePlanOutput(parsed);
  } catch (validationError) {
    throw new AIInvalidOutputError(
      `Gemini output failed validation after retry: ${
        validationError instanceof Error
          ? validationError.message
          : String(validationError)
      }`,
    );
  }
}
