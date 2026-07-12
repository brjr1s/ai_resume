import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { sendValidationError } from "../lib/http.js";
import { createResume, listResumes } from "../services/resumeStore.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

const textResumeSchema = z.object({
  title: z.string().trim().optional(),
  text: z.string().trim().min(20, "简历文本至少需要 20 个字符")
});

export const resumesRouter = Router();

resumesRouter.get("/", (_request, response) => {
  response.json({
    items: listResumes()
  });
});

resumesRouter.post("/text", (request, response) => {
  const parsed = textResumeSchema.safeParse(request.body);

  if (!parsed.success) {
    sendValidationError(response, parsed.error);
    return;
  }

  const record = createResume({
    title: parsed.data.title,
    source: "text",
    rawText: parsed.data.text
  });

  response.status(201).json(record);
});

resumesRouter.post(
  "/upload",
  upload.single("file"),
  (request, response) => {
    if (!request.file) {
      response.status(400).json({
        error: {
          code: "FILE_REQUIRED",
          message: "请上传 PDF、DOCX 或 TXT 文件"
        }
      });
      return;
    }

    const extension = request.file.originalname.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "doc", "docx", "txt"];

    if (!extension || !allowed.includes(extension)) {
      response.status(400).json({
        error: {
          code: "UNSUPPORTED_FILE_TYPE",
          message: "当前仅支持 PDF、DOC、DOCX、TXT"
        }
      });
      return;
    }

    const rawText =
      extension === "txt"
        ? request.file.buffer.toString("utf8")
        : `已接收文件：${request.file.originalname}。PDF/DOCX 正文解析将在文档解析服务中接入。`;

    const record = createResume({
      source: "file",
      rawText,
      fileName: request.file.originalname
    });

    response.status(201).json(record);
  }
);
