import { Router } from "express";
import { z } from "zod";
import { sendValidationError } from "../lib/http.js";
import { generateInterviewQuestions } from "../services/analyzer.js";

const interviewSchema = z.object({
  resumeText: z.string().trim().min(20, "简历文本至少需要 20 个字符"),
  jdText: z.string().trim().min(20, "JD 文本至少需要 20 个字符")
});

export const interviewsRouter = Router();

interviewsRouter.post("/questions", (request, response) => {
  const parsed = interviewSchema.safeParse(request.body);

  if (!parsed.success) {
    sendValidationError(response, parsed.error);
    return;
  }

  response.json({
    items: generateInterviewQuestions(parsed.data.resumeText, parsed.data.jdText)
  });
});
