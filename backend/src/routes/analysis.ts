import { Router } from "express";
import { z } from "zod";
import { sendValidationError } from "../lib/http.js";
import {
  analyzeResumeMatch,
  buildSuggestions
} from "../services/analyzer.js";

const analysisSchema = z.object({
  resumeText: z.string().trim().min(20, "简历文本至少需要 20 个字符"),
  jdText: z.string().trim().min(20, "JD 文本至少需要 20 个字符")
});

export const analysisRouter = Router();

analysisRouter.post("/match", (request, response) => {
  const parsed = analysisSchema.safeParse(request.body);

  if (!parsed.success) {
    sendValidationError(response, parsed.error);
    return;
  }

  response.json(analyzeResumeMatch(parsed.data.resumeText, parsed.data.jdText));
});

analysisRouter.post("/suggestions", (request, response) => {
  const parsed = analysisSchema.safeParse(request.body);

  if (!parsed.success) {
    sendValidationError(response, parsed.error);
    return;
  }

  const report = analyzeResumeMatch(parsed.data.resumeText, parsed.data.jdText);

  response.json({
    items: buildSuggestions(parsed.data.resumeText, report.missingKeywords)
  });
});
