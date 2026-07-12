import type {
  MatchReport,
  ParsedJob,
  ReplacementSuggestion
} from "../types.js";

const knownKeywords = [
  "react",
  "vue",
  "typescript",
  "javascript",
  "node",
  "python",
  "java",
  "spring",
  "fastapi",
  "nestjs",
  "mysql",
  "postgresql",
  "redis",
  "docker",
  "kubernetes",
  "微服务",
  "性能优化",
  "数据分析",
  "项目管理",
  "ai",
  "llm",
  "大模型"
];

export function parseJobDescription(jdText: string): ParsedJob {
  const lines = splitLines(jdText);
  const keywords = extractKeywords(jdText);

  return {
    title: detectTitle(lines),
    responsibilities: lines.filter((line) =>
      /负责|参与|建设|设计|开发|优化|推进|协作/.test(line)
    ),
    requirements: lines.filter((line) =>
      /要求|熟悉|掌握|具备|经验|能力|优先|本科|学历/.test(line)
    ),
    keywords
  };
}

export function analyzeResumeMatch(
  resumeText: string,
  jdText: string
): MatchReport {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jdText);
  const coveredKeywords = jobKeywords.filter((keyword) =>
    resumeKeywords.includes(keyword)
  );
  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywords.includes(keyword)
  );

  const keywordCoverage =
    jobKeywords.length === 0
      ? 70
      : Math.round((coveredKeywords.length / jobKeywords.length) * 100);
  const skillScore = clamp(Math.round(keywordCoverage * 0.75 + 22), 45, 95);
  const experienceScore = scoreExperience(resumeText, jdText);
  const projectScore = scoreProjectQuality(resumeText);
  const expressionScore = scoreExpressionQuality(resumeText);

  const totalScore = Math.round(
    skillScore * 0.3 +
      experienceScore * 0.25 +
      projectScore * 0.2 +
      keywordCoverage * 0.15 +
      expressionScore * 0.1
  );

  return {
    totalScore,
    dimensions: [
      {
        name: "技能匹配",
        score: skillScore,
        maxScore: 100,
        reason:
          coveredKeywords.length > 0
            ? `已覆盖 ${coveredKeywords.slice(0, 5).join("、")} 等关键词`
            : "简历中暂未识别到明显的岗位技术关键词"
      },
      {
        name: "经历匹配",
        score: experienceScore,
        maxScore: 100,
        reason: "根据岗位职责动词和简历经历描述的重合度估算"
      },
      {
        name: "关键词覆盖",
        score: keywordCoverage,
        maxScore: 100,
        reason:
          missingKeywords.length > 0
            ? `建议补充 ${missingKeywords.slice(0, 5).join("、")}`
            : "岗位关键词覆盖较完整"
      }
    ],
    advantages: buildAdvantages(coveredKeywords, resumeText),
    problems: buildProblems(missingKeywords, resumeText),
    missingKeywords,
    suggestions: buildSuggestions(resumeText, missingKeywords)
  };
}

export function buildSuggestions(
  resumeText: string,
  missingKeywords: string[]
): ReplacementSuggestion[] {
  const firstResumeLine =
    splitLines(resumeText).find((line) => line.length > 8) ?? "负责相关项目开发";
  const keywordText =
    missingKeywords.length > 0
      ? `，并补充 ${missingKeywords.slice(0, 3).join("、")} 等岗位关键词`
      : "";

  return [
    {
      original: firstResumeLine,
      issue: "表达偏职责描述，缺少业务场景、动作和结果",
      advice: "改成“场景 + 行动 + 结果”的结构",
      rewritten: `${firstResumeLine}，围绕核心业务流程完成方案设计、开发与交付${keywordText}，提升交付效率和岗位匹配度`
    },
    {
      original: "参与项目开发和维护",
      issue: "信息密度低，不能体现个人贡献",
      advice: "明确负责模块、技术动作和可验证成果",
      rewritten: "负责核心模块开发与维护，沉淀可复用组件和接口规范，减少重复开发并提升团队协作效率"
    }
  ];
}

export function generateInterviewQuestions(
  resumeText: string,
  jdText: string
) {
  const keywords = extractKeywords(`${resumeText}\n${jdText}`).slice(0, 6);

  return [
    "请介绍一个最能体现你岗位匹配度的项目，并说明你的具体贡献。",
    "项目中遇到过哪些技术难点？你是如何定位并解决的？",
    "如果入职后负责类似 JD 中的核心任务，你会如何拆解第一阶段工作？",
    ...keywords.map((keyword) => `请结合你的经历说明你对 ${keyword} 的实际使用方式。`)
  ];
}

function extractKeywords(text: string) {
  const lowerText = text.toLowerCase();

  return knownKeywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

function splitLines(text: string) {
  return text
    .split(/\r?\n|。|；|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function detectTitle(lines: string[]) {
  const titleLine = lines.find((line) => /岗位|职位|工程师|经理|专家/.test(line));
  return titleLine?.replace(/^岗位[:：]?/, "").slice(0, 40) || "目标岗位";
}

function scoreExperience(resumeText: string, jdText: string) {
  const verbs = ["负责", "设计", "开发", "优化", "推进", "协作", "交付"];
  const matched = verbs.filter(
    (verb) => resumeText.includes(verb) && jdText.includes(verb)
  ).length;

  return clamp(58 + matched * 6, 50, 92);
}

function scoreProjectQuality(resumeText: string) {
  const hasProject = /项目|系统|平台|产品|模块/.test(resumeText);
  const hasMetrics = /\d+%|\d+人|\d+万|\d+次|\d+s|\d+ms/.test(resumeText);

  return clamp(58 + (hasProject ? 12 : 0) + (hasMetrics ? 16 : 0), 45, 94);
}

function scoreExpressionQuality(resumeText: string) {
  const lines = splitLines(resumeText);
  const avgLength =
    lines.length === 0
      ? 0
      : lines.reduce((total, line) => total + line.length, 0) / lines.length;

  return clamp(Math.round(52 + Math.min(avgLength, 40)), 50, 90);
}

function buildAdvantages(coveredKeywords: string[], resumeText: string) {
  const advantages = [];

  if (coveredKeywords.length > 0) {
    advantages.push(`技术关键词覆盖较好，已命中 ${coveredKeywords.slice(0, 4).join("、")}`);
  }

  if (/项目|系统|平台|模块/.test(resumeText)) {
    advantages.push("项目经历与岗位要求有一定相关性");
  }

  return advantages.length > 0 ? advantages : ["简历已有基础经历信息，可继续增强岗位指向性"];
}

function buildProblems(missingKeywords: string[], resumeText: string) {
  const problems = [];

  if (!/\d+%|\d+人|\d+万|\d+次|\d+s|\d+ms/.test(resumeText)) {
    problems.push("项目成果缺少量化数据");
  }

  if (missingKeywords.length > 0) {
    problems.push(`JD 关键词覆盖不足，缺少 ${missingKeywords.slice(0, 4).join("、")}`);
  }

  if (!/业务|行业|用户|客户|增长|转化/.test(resumeText)) {
    problems.push("业务背景和岗位价值表达不足");
  }

  return problems;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
