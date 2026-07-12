export type DimensionScore = {
  name: string;
  score: number;
  maxScore: number;
  reason: string;
};

export type ReplacementSuggestion = {
  original: string;
  issue: string;
  advice: string;
  rewritten: string;
};

export type MatchReport = {
  totalScore: number;
  dimensions: DimensionScore[];
  advantages: string[];
  problems: string[];
  missingKeywords: string[];
  suggestions: ReplacementSuggestion[];
};

export type ParsedJob = {
  title: string;
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
};

export type ResumeRecord = {
  id: string;
  title: string;
  source: "text" | "file";
  rawText: string;
  fileName?: string;
  createdAt: string;
};
