import { validatePlanOutput, stripMarkdownFences } from "./validate";

describe("validatePlanOutput", () => {
  const mockQuiz = {
    question: "Q?",
    options: ["A", "B", "C", "D"],
    correctIndex: 0,
    explanation: "Why it is A.",
  };
  const mockFlashcards = [
    { front: "Front 1", back: "Back 1" },
    { front: "Front 2", back: "Back 2" },
  ];

  const validPlan = {
    category: "general",
    summary: "A bouldering starter curriculum",
    techniques: [
      {
        name: "Technique 1",
        description: "Practice by doing A.",
        whyItMatters: "Important for B.",
        order: 1,
        searchQuery: "query 1",
        quiz: mockQuiz,
        flashcards: mockFlashcards,
      },
      {
        name: "Technique 2",
        description: "Practice by doing C.",
        whyItMatters: "Important for D.",
        order: 2,
        searchQuery: "query 2",
        quiz: mockQuiz,
        flashcards: mockFlashcards,
      },
      {
        name: "Technique 3",
        description: "Practice by doing E.",
        whyItMatters: "Important for F.",
        order: 3,
        searchQuery: "query 3",
        quiz: mockQuiz,
        flashcards: mockFlashcards,
      },
      {
        name: "Technique 4",
        description: "Practice by doing G.",
        whyItMatters: "Important for H.",
        order: 4,
        searchQuery: "query 4",
        quiz: mockQuiz,
        flashcards: mockFlashcards,
      },
      {
        name: "Technique 5",
        description: "Practice by doing I.",
        whyItMatters: "Important for J.",
        order: 5,
        searchQuery: "query 5",
        quiz: mockQuiz,
        flashcards: mockFlashcards,
      },
    ],
  };

  it("accepts a valid plan with correct technique count and order", () => {
    const result = validatePlanOutput(validPlan);
    expect(result).toEqual(validPlan);
  });

  it("accepts a NOT_A_HOBBY error output", () => {
    const errorOutput = { error: "NOT_A_HOBBY" };
    const result = validatePlanOutput(errorOutput);
    expect(result).toEqual(errorOutput);
  });

  it("rejects output with less than 5 techniques", () => {
    const invalidPlan = {
      ...validPlan,
      techniques: validPlan.techniques.slice(0, 4),
    };
    expect(() => validatePlanOutput(invalidPlan)).toThrow();
  });

  it("rejects output with more than 8 techniques", () => {
    const invalidPlan = {
      ...validPlan,
      techniques: [
        ...validPlan.techniques,
        {
          name: "T6",
          description: "Desc",
          whyItMatters: "Why",
          order: 6,
          searchQuery: "Q6",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T7",
          description: "Desc",
          whyItMatters: "Why",
          order: 7,
          searchQuery: "Q7",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T8",
          description: "Desc",
          whyItMatters: "Why",
          order: 8,
          searchQuery: "Q8",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T9",
          description: "Desc",
          whyItMatters: "Why",
          order: 9,
          searchQuery: "Q9",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
      ],
    };
    expect(() => validatePlanOutput(invalidPlan)).toThrow();
  });

  it("rejects output with duplicate order numbers", () => {
    const invalidPlan = {
      category: "general",
      summary: "Duplicate orders",
      techniques: [
        {
          name: "T1",
          description: "Desc",
          whyItMatters: "Why",
          order: 1,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T2",
          description: "Desc",
          whyItMatters: "Why",
          order: 2,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T3",
          description: "Desc",
          whyItMatters: "Why",
          order: 2,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T4",
          description: "Desc",
          whyItMatters: "Why",
          order: 4,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T5",
          description: "Desc",
          whyItMatters: "Why",
          order: 5,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
      ],
    };
    expect(() => validatePlanOutput(invalidPlan)).toThrow(/unique/);
  });

  it("rejects output with non-contiguous order numbers", () => {
    const invalidPlan = {
      category: "general",
      summary: "Non-contiguous orders",
      techniques: [
        {
          name: "T1",
          description: "Desc",
          whyItMatters: "Why",
          order: 1,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T2",
          description: "Desc",
          whyItMatters: "Why",
          order: 3,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        }, // skip 2
        {
          name: "T3",
          description: "Desc",
          whyItMatters: "Why",
          order: 4,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T4",
          description: "Desc",
          whyItMatters: "Why",
          order: 5,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T5",
          description: "Desc",
          whyItMatters: "Why",
          order: 6,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
      ],
    };
    expect(() => validatePlanOutput(invalidPlan)).toThrow(/contiguous/);
  });

  it("rejects output with order numbers not starting from 1", () => {
    const invalidPlan = {
      category: "general",
      summary: "Starts from 2",
      techniques: [
        {
          name: "T1",
          description: "Desc",
          whyItMatters: "Why",
          order: 2,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T2",
          description: "Desc",
          whyItMatters: "Why",
          order: 3,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T3",
          description: "Desc",
          whyItMatters: "Why",
          order: 4,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T4",
          description: "Desc",
          whyItMatters: "Why",
          order: 5,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
        {
          name: "T5",
          description: "Desc",
          whyItMatters: "Why",
          order: 6,
          searchQuery: "Q",
          quiz: mockQuiz,
          flashcards: mockFlashcards,
        },
      ],
    };
    expect(() => validatePlanOutput(invalidPlan)).toThrow(/contiguous/);
  });
});

describe("stripMarkdownFences", () => {
  it("strips ```json ... ``` fences correctly", () => {
    const jsonStr = '{\n  "summary": "plan"\n}';
    const input = `\`\`\`json\n${jsonStr}\n\`\`\``;
    expect(stripMarkdownFences(input)).toBe(jsonStr);
  });

  it("strips plain ``` ... ``` fences correctly", () => {
    const jsonStr = '{\n  "summary": "plan"\n}';
    const input = `\`\`\`\n${jsonStr}\n\`\`\``;
    expect(stripMarkdownFences(input)).toBe(jsonStr);
  });

  it("leaves already-clean JSON string intact", () => {
    const input = '{"summary": "plan"}';
    expect(stripMarkdownFences(input)).toBe(input);
  });
});
