import { Router } from "express";
import { z } from "zod";
import { sendValidationError } from "../lib/http.js";
import { parseJobDescription } from "../services/analyzer.js";

const parseJobSchema = z.object({
  jdText: z.string().trim().min(20, "JD 文本至少需要 20 个字符")
});

export const jobsRouter = Router();

jobsRouter.post("/parse", (request, response) => {
  const parsed = parseJobSchema.safeParse(request.body);

  if (!parsed.success) {
    sendValidationError(response, parsed.error);
    return;
  }

  response.json(parseJobDescription(parsed.data.jdText));
});
