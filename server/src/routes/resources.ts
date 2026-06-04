import { Router, Request, Response } from "express";
import { z } from "zod";
import { searchVideos } from "../services/youtube";

const router = Router();

// ── Query validation ───────────────────────────────────────────────────────

const resourcesQuerySchema = z.object({
  q: z.string().min(1, "q query parameter is required"),
  max: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 3;
      const num = parseInt(val, 10);
      if (isNaN(num)) return 3;
      return Math.min(Math.max(num, 1), 5);
    }),
});

// ── GET /api/resources ─────────────────────────────────────────────────────

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const parseResult = resourcesQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    const issues = parseResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    res.status(400).json({ error: "INVALID_REQUEST", details: issues });
    return;
  }

  const { q, max } = parseResult.data;

  try {
    const result = await searchVideos(q, max);

    if (result.degraded) {
      res.status(200).json({ resources: [], degraded: true });
      return;
    }

    res.status(200).json({ resources: result.resources });
  } catch (err) {
    // Let global error handler deal with unexpected errors
    throw err;
  }
});

export default router;
