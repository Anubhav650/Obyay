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

const SYSTEM_PROMPT = `You are Obyay's curriculum designer. Given a hobby and a learner's goal
level, produce a focused learning plan of 5 to 8 techniques.

Rules:
1. Choose techniques a real instructor would prioritize. Order them so
   that earlier techniques are prerequisites or foundations for later
   ones (order = 1 is learned first).
2. Calibrate to the goal level:
   - "casual": fundamentals only, fun fast, 5-6 techniques.
   - "hobbyist": fundamentals plus intermediate skills, 6-7 techniques.
   - "serious": include advanced technique and deliberate-practice
     skills, 7-8 techniques.
3. Each technique must be a concrete, practicable skill ("Flagging"),
   never a vague theme ("Get better at climbing").
4. "description": 2-3 plain-language sentences explaining what the
   technique is and how to practice it. No jargon without explanation.
5. "whyItMatters": one motivating sentence.
6. "searchQuery": the exact YouTube search string most likely to find a
   high-quality tutorial for this technique at this level. Include the
   hobby name and the word "tutorial" or "technique".
7. "summary": one sentence framing the whole plan for this learner.
8. If the input is not a learnable hobby or skill (e.g. gibberish, a
   request for something else), return {"error": "NOT_A_HOBBY"}.

Respond with ONLY valid JSON matching exactly this shape, no markdown,
no commentary:

{
  "summary": string,
  "techniques": [
    {
      "name": string,
      "description": string,
      "whyItMatters": string,
      "order": number,
      "searchQuery": string
    }
  ]
}`;

// ── Service ────────────────────────────────────────────────────────────────

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIUnavailableError("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
}

/**
 * Generate a learning plan for the given hobby and goal level.
 * Returns a validated GeminiOutput (either a plan or NOT_A_HOBBY error).
 *
 * Retries once if the first response fails validation.
 */
export async function generatePlan(
  hobby: string,
  level: string
): Promise<GeminiOutput> {
  const model = getModel();
  const userMessage = `Hobby: ${hobby}\nGoal level: ${level}`;

  let responseText: string;

  try {
    const result = await model.generateContent(userMessage);
    responseText = result.response.text();
  } catch (err) {
    throw new AIUnavailableError(
      `Gemini API call failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // First attempt: parse and validate
  const cleaned = stripMarkdownFences(responseText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // JSON parse failed — retry
    return retryWithFeedback(
      model,
      userMessage,
      `Output was not valid JSON: ${cleaned.slice(0, 200)}`
    );
  }

  try {
    return validatePlanOutput(parsed);
  } catch (validationError) {
    const issues =
      validationError instanceof Error
        ? validationError.message
        : String(validationError);
    return retryWithFeedback(model, userMessage, issues);
  }
}

async function retryWithFeedback(
  model: ReturnType<typeof getModel>,
  originalMessage: string,
  issues: string
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
      `Gemini retry failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const cleaned = stripMarkdownFences(responseText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AIInvalidOutputError(
      `Gemini output is not valid JSON after retry: ${cleaned.slice(0, 200)}`
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
      }`
    );
  }
}
