import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    status: "ok",
    service: "ai-resume-assistant-backend",
    time: new Date().toISOString()
  });
});
