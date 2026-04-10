import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateGuidedQuestionsBody } from "@workspace/api-zod";

const router = Router();

const SYSTEM_PROMPT = `You are a mindful mental wellness guide inside an interactive app. Your tone is calm, warm, supportive, and completely non-judgmental — like a wise, caring friend.

When a user shares what they are going through, generate exactly 6 to 7 follow-up questions that:
- Are very easy to understand (short, conversational)
- Ask only one thing at a time
- Gradually narrow down the situation from general to specific
- Move step-by-step through: general feeling → why → triggers → intensity → impact → action/reflection
- Are max 10 words each
- Never repeat similar wording across questions
- Sound natural and human — not clinical or formal

Structure your questions like this (do not include labels, just the questions):
1. General feeling question
2. Explore the why
3. Identify triggers
4. Check intensity
5. Explore real-world impact
6. Gentle action or reflection question
(optional 7th if naturally needed)

Return ONLY a valid JSON array of strings with the questions. No explanation, no markdown, no extra text. Example:
["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]`;

router.post("/questions", async (req, res) => {
  const parsed = GenerateGuidedQuestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { userInput } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";

    let questions: string[];
    try {
      const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      questions = JSON.parse(trimmed);
      if (!Array.isArray(questions) || questions.length < 6) {
        throw new Error("Invalid format");
      }
    } catch {
      res.status(500).json({ error: "Failed to parse questions from AI response" });
      return;
    }

    res.json({ questions: questions.slice(0, 7) });
  } catch (err) {
    req.log.error({ err }, "Failed to generate guided questions");
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

export { router as guidedChatRouter };
