import cors from "cors";
import express from "express";
import { analysisRouter } from "./routes/analysis.js";
import { healthRouter } from "./routes/health.js";
import { interviewsRouter } from "./routes/interviews.js";
import { jobsRouter } from "./routes/jobs.js";
import { resumesRouter } from "./routes/resumes.js";

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
];

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : [])
];

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    })
  );

  app.use(express.json({ limit: "2mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/resumes", resumesRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/analysis", analysisRouter);
  app.use("/api/interviews", interviewsRouter);

  app.use((_, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "接口不存在"
      }
    });
  });

  app.use(
    (
      error: Error,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction
    ) => {
      response.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "服务内部错误"
        }
      });
    }
  );

  return app;
}
