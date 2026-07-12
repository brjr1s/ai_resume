import type { Response } from "express";
import type { ZodError } from "zod";

export function sendValidationError(response: Response, error: ZodError) {
  response.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "请求参数不合法",
      details: error.flatten()
    }
  });
}
