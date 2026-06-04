import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────────────────

export const techniqueSchema = z.object({
  name: z.string().min(1, "name must be non-empty"),
  description: z.string().min(1, "description must be non-empty"),
  whyItMatters: z.string().min(1, "whyItMatters must be non-empty"),
  order: z.number().int().positive("order must be a positive integer"),
  searchQuery: z
    .string()
    .min(1, "searchQuery must be non-empty")
    .max(100, "searchQuery must be at most 100 characters"),
});

export const planOutputSchema = z.object({
  summary: z.string().min(1, "summary must be non-empty"),
  techniques: z
    .array(techniqueSchema)
    .min(5, "techniques must have at least 5 items")
    .max(8, "techniques must have at most 8 items"),
});

export const errorOutputSchema = z.object({
  error: z.literal("NOT_A_HOBBY"),
});

export const geminiOutputSchema = z.discriminatedUnion("error", [
  // planOutputSchema doesn't have "error", so we use a manual union:
  // discriminatedUnion requires a shared discriminator key.
  // Instead we use a regular union with custom logic.
  errorOutputSchema,
]);

// We can't use discriminatedUnion cleanly here because planOutputSchema
// doesn't have the "error" key. Use a manual union instead.
export type PlanOutput = z.infer<typeof planOutputSchema>;
export type ErrorOutput = z.infer<typeof errorOutputSchema>;
export type GeminiOutput = PlanOutput | ErrorOutput;

export type Technique = z.infer<typeof techniqueSchema>;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Strips markdown JSON fences (```json ... ```) from AI output.
 */
export function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  // Remove opening fence: ```json or ``` (with optional language tag)
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  // Remove closing fence
  cleaned = cleaned.replace(/\n?```\s*$/i, "");
  return cleaned.trim();
}

/**
 * Validates the Gemini output: either a valid plan (with contiguous
 * unique order values starting from 1) or a NOT_A_HOBBY error.
 *
 * Throws a descriptive error string on validation failure.
 */
export function validatePlanOutput(raw: unknown): GeminiOutput {
  // First, try parsing as the error shape
  const errorResult = errorOutputSchema.safeParse(raw);
  if (errorResult.success) {
    return errorResult.data;
  }

  // Then try parsing as the plan shape
  const planResult = planOutputSchema.safeParse(raw);
  if (!planResult.success) {
    const issues = planResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${issues}`);
  }

  const plan = planResult.data;

  // Additional validation: order values must be unique and contiguous from 1
  const orders = plan.techniques.map((t) => t.order).sort((a, b) => a - b);
  const expected = plan.techniques.map((_, i) => i + 1);

  if (orders.length !== new Set(orders).size) {
    throw new Error(
      "Validation failed: order values must be unique"
    );
  }

  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== expected[i]) {
      throw new Error(
        `Validation failed: order values must be contiguous from 1, ` +
          `expected ${expected.join(",")} but got ${orders.join(",")}`
      );
    }
  }

  return plan;
}
