import { randomUUID } from "node:crypto";
import type { ResumeRecord } from "../types.js";

const resumes = new Map<string, ResumeRecord>();

export function createResume(input: {
  title?: string;
  source: "text" | "file";
  rawText: string;
  fileName?: string;
}) {
  const record: ResumeRecord = {
    id: randomUUID(),
    title: input.title || input.fileName || "未命名简历",
    source: input.source,
    rawText: input.rawText,
    fileName: input.fileName,
    createdAt: new Date().toISOString()
  };

  resumes.set(record.id, record);
  return record;
}

export function listResumes() {
  return Array.from(resumes.values()).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}
