import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  generatePlan,
  AIInvalidOutputError,
  AIUnavailableError,
} from "../services/gemini";
import { PlanOutput } from "../lib/validate";

const router = Router();

// ── Request validation ─────────────────────────────────────────────────────

const planRequestSchema = z.object({
  hobby: z.string().min(1, "hobby must be a non-empty string"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

// ── POST /api/plan ─────────────────────────────────────────────────────────

router.post("/", async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const parseResult = planRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issues = parseResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    res.status(400).json({ error: "INVALID_REQUEST", details: issues });
    return;
  }

  const { hobby, level } = parseResult.data;

  try {
    const output = await generatePlan(hobby, level);

    // Check if it's a NOT_A_HOBBY error
    if ("error" in output) {
      res.status(422).json({ error: output.error });
      return;
    }

    // It's a valid plan
    const plan = output as PlanOutput;
    res.status(200).json({
      plan: {
        hobby,
        category: plan.category,
        summary: plan.summary,
        techniques: plan.techniques,
      },
    });
  } catch (err) {
    if (err instanceof AIInvalidOutputError) {
      res.status(422).json({ error: "AI_INVALID_OUTPUT" });
      return;
    }
    if (err instanceof AIUnavailableError) {
      console.error("AI_UNAVAILABLE error:", err.message);
      res.status(502).json({ error: "AI_UNAVAILABLE" });
      return;
    }
    // Unexpected error — let the global handler deal with it
    throw err;
  }
});

export default router;
