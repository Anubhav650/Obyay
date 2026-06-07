import type { Hobby, Progress } from "../types/models";

/**
 * Calculates learning progress stats for a given hobby.
 */
export const getProgress = (hobby: Hobby): Progress => {
  const total = hobby.techniques.length;
  const mastered = hobby.techniques.filter(
    (t) => t.status === "mastered",
  ).length;
  const skipped = hobby.techniques.filter((t) => t.status === "skipped").length;
  const remaining = total - mastered - skipped;
  const denominator = total - skipped;
  const percent =
    denominator > 0 ? Math.round((mastered / denominator) * 100) : 0;

  return { total, mastered, skipped, remaining, percent };
};
