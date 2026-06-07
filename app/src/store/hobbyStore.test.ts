import { getProgress } from "./hobbyStore";
import type { Hobby } from "../types/models";

describe("getProgress", () => {
  const baseHobby: Hobby = {
    id: "test-id",
    name: "Bouldering",
    level: "intermediate",
    category: "general",
    summary: "A bouldering starter curriculum",
    techniques: [],
    createdAt: new Date().toISOString(),
  };

  it("handles empty plan correctly", () => {
    const hobby: Hobby = { ...baseHobby, techniques: [] };
    const progress = getProgress(hobby);

    expect(progress.total).toBe(0);
    expect(progress.mastered).toBe(0);
    expect(progress.skipped).toBe(0);
    expect(progress.remaining).toBe(0);
    expect(progress.percent).toBe(0);
  });

  it("handles mixed states correctly", () => {
    const hobby: Hobby = {
      ...baseHobby,
      techniques: [
        {
          id: "1",
          name: "T1",
          description: "",
          whyItMatters: "",
          order: 1,
          searchQuery: "",
          status: "mastered",
          statusUpdatedAt: null,
          resources: null,
        },
        {
          id: "2",
          name: "T2",
          description: "",
          whyItMatters: "",
          order: 2,
          searchQuery: "",
          status: "pending",
          statusUpdatedAt: null,
          resources: null,
        },
        {
          id: "3",
          name: "T3",
          description: "",
          whyItMatters: "",
          order: 3,
          searchQuery: "",
          status: "skipped",
          statusUpdatedAt: null,
          resources: null,
        },
        {
          id: "4",
          name: "T4",
          description: "",
          whyItMatters: "",
          order: 4,
          searchQuery: "",
          status: "mastered",
          statusUpdatedAt: null,
          resources: null,
        },
      ],
    };
    const progress = getProgress(hobby);

    expect(progress.total).toBe(4);
    expect(progress.mastered).toBe(2);
    expect(progress.skipped).toBe(1);
    expect(progress.remaining).toBe(1);
    // Denominator = total - skipped = 4 - 1 = 3
    // Percent = mastered / denominator = 2 / 3 = 67%
    expect(progress.percent).toBe(67);
  });

  it("handles all skipped correctly (percent must be 0, not NaN)", () => {
    const hobby: Hobby = {
      ...baseHobby,
      techniques: [
        {
          id: "1",
          name: "T1",
          description: "",
          whyItMatters: "",
          order: 1,
          searchQuery: "",
          status: "skipped",
          statusUpdatedAt: null,
          resources: null,
        },
        {
          id: "2",
          name: "T2",
          description: "",
          whyItMatters: "",
          order: 2,
          searchQuery: "",
          status: "skipped",
          statusUpdatedAt: null,
          resources: null,
        },
      ],
    };
    const progress = getProgress(hobby);

    expect(progress.total).toBe(2);
    expect(progress.mastered).toBe(0);
    expect(progress.skipped).toBe(2);
    expect(progress.percent).toBe(0);
  });

  it("handles all mastered correctly", () => {
    const hobby: Hobby = {
      ...baseHobby,
      techniques: [
        {
          id: "1",
          name: "T1",
          description: "",
          whyItMatters: "",
          order: 1,
          searchQuery: "",
          status: "mastered",
          statusUpdatedAt: null,
          resources: null,
        },
        {
          id: "2",
          name: "T2",
          description: "",
          whyItMatters: "",
          order: 2,
          searchQuery: "",
          status: "mastered",
          statusUpdatedAt: null,
          resources: null,
        },
      ],
    };
    const progress = getProgress(hobby);

    expect(progress.total).toBe(2);
    expect(progress.mastered).toBe(2);
    expect(progress.skipped).toBe(0);
    expect(progress.percent).toBe(100);
  });
});
