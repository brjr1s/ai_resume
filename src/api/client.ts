import type {
  InterviewQuestionsResponse,
  MatchReport,
  ParsedJob,
  ResumeRecord
} from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3002/api";

export const apiClient = {
  uploadResume(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return request<ResumeRecord>("/resumes/upload", {
      method: "POST",
      body: formData
    });
  },

  createTextResume(text: string, title?: string) {
    return request<ResumeRecord>("/resumes/text", {
      method: "POST",
      body: JSON.stringify({ text, title })
    });
  },

  parseJob(jdText: string) {
    return request<ParsedJob>("/jobs/parse", {
      method: "POST",
      body: JSON.stringify({ jdText })
    });
  },

  analyzeMatch(resumeText: string, jdText: string) {
    return request<MatchReport>("/analysis/match", {
      method: "POST",
      body: JSON.stringify({ resumeText, jdText })
    });
  },

  generateInterviewQuestions(resumeText: string, jdText: string) {
    return request<InterviewQuestionsResponse>("/interviews/questions", {
      method: "POST",
      body: JSON.stringify({ resumeText, jdText })
    });
  }
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return body?.error?.message ?? `请求失败：${response.status}`;
  } catch {
    return `请求失败：${response.status}`;
  }
}
