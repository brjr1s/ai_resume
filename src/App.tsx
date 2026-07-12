import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Upload,
  WandSparkles,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "./api/client";
import type { MatchReport, ParsedJob } from "./api/types";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

export function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  const [report, setReport] = useState<MatchReport | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const canAnalyze = useMemo(
    () => resumeText.trim().length > 0 && jobDescription.trim().length > 0,
    [resumeText, jobDescription]
  );

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 88) {
          return value;
        }

        return Math.min(value + 8, 88);
      });
    }, 220);

    return () => window.clearInterval(timer);
  }, [isAnalyzing]);

  const showToast = (type: Toast["type"], message: string) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3200);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const record = await apiClient.uploadResume(file);
      setResumeId(record.id);

      if (record.rawText.trim()) {
        setResumeText(record.rawText);
      }

      showToast("success", `上传成功：${file.name}`);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "上传失败，请稍后重试"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      showToast("error", "请先填写简历文本和目标岗位 JD");
      return;
    }

    setIsAnalyzing(true);
    setProgress(6);
    setInterviewQuestions([]);

    try {
      const [resumeRecord, jobInfo, matchReport] = await Promise.all([
        apiClient.createTextResume(resumeText, fileName || "文本简历"),
        apiClient.parseJob(jobDescription),
        apiClient.analyzeMatch(resumeText, jobDescription)
      ]);

      setResumeId(resumeRecord.id);
      setParsedJob(jobInfo);
      setReport(matchReport);
      setProgress(100);
      showToast("success", "分析完成，已生成匹配度和修改建议");
    } catch (error) {
      setProgress(0);
      showToast(
        "error",
        error instanceof Error ? error.message : "分析失败，请检查后端服务"
      );
    } finally {
      window.setTimeout(() => {
        setIsAnalyzing(false);
      }, 320);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!canAnalyze) {
      showToast("error", "请先填写简历文本和目标岗位 JD");
      return;
    }

    setIsGeneratingQuestions(true);

    try {
      const response = await apiClient.generateInterviewQuestions(
        resumeText,
        jobDescription
      );
      setInterviewQuestions(response.items);
      showToast("success", "面试题已生成");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "生成面试题失败"
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleClear = () => {
    setResumeText("");
    setJobDescription("");
    setFileName("");
    setResumeId("");
    setParsedJob(null);
    setReport(null);
    setInterviewQuestions([]);
    setProgress(0);
    showToast("info", "已清空简历、JD 和分析结果");
  };

  return (
    <main className="app-shell">
      <ToastStack
        items={toasts}
        onClose={(id) =>
          setToasts((items) => items.filter((item) => item.id !== id))
        }
      />

      <section className="workspace" aria-label="AI 简历助手工作区">
        <header className="app-header">
          <div>
            <p className="eyebrow">AI Resume Assistant</p>
            <h1>AI 简历助手</h1>
          </div>
          <span className="status-pill">前后端联调版</span>
        </header>

        <section className="input-grid" aria-label="简历与岗位输入">
          <article className="input-panel">
            <div className="panel-title">
              <FileText size={20} aria-hidden="true" />
              <h2>上传/粘贴简历</h2>
            </div>

            <label className={`upload-box ${isUploading ? "is-loading" : ""}`}>
              {isUploading ? (
                <Loader2 size={22} aria-hidden="true" className="spin-icon" />
              ) : (
                <Upload size={22} aria-hidden="true" />
              )}
              <span>
                {isUploading
                  ? "正在上传..."
                  : fileName || "上传 PDF / DOCX / TXT 文件"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </label>

            {resumeId && (
              <p className="meta-line">已保存简历记录：{resumeId.slice(0, 8)}</p>
            )}

            <textarea
              className="text-area"
              placeholder="在这里粘贴简历文本；TXT 上传后会自动填入，PDF / DOCX 正文解析将在下一步接入"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
            />
          </article>

          <article className="input-panel">
            <div className="panel-title">
              <BriefcaseBusiness size={20} aria-hidden="true" />
              <h2>目标岗位 JD</h2>
            </div>

            <textarea
              className="text-area jd-area"
              placeholder="粘贴招聘描述、岗位职责、任职要求等内容"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />

            {parsedJob && (
              <div className="job-summary">
                <strong>岗位解析</strong>
                <span>{parsedJob.title}</span>
                {parsedJob.keywords.length > 0 && (
                  <small>关键词：{parsedJob.keywords.join("、")}</small>
                )}
              </div>
            )}
          </article>
        </section>

        <section className="action-row" aria-label="分析操作">
          <div className="action-controls">
            <button
              className="primary-button"
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <Loader2 size={18} aria-hidden="true" className="spin-icon" />
              ) : (
                <Sparkles size={18} aria-hidden="true" />
              )}
              {isAnalyzing ? "分析中..." : "开始分析"}
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={isAnalyzing}
              onClick={handleClear}
            >
              <RotateCcw size={18} aria-hidden="true" />
              清空
            </button>
          </div>

          {(isAnalyzing || progress > 0) && (
            <div className="progress-area" aria-live="polite">
              <div className="progress-label">
                <span>{isAnalyzing ? "正在分析简历与 JD 匹配度" : "分析完成"}</span>
                <strong>{progress}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </section>

        <section className="score-section" aria-label="匹配度评分">
          <div className="score-main">
            <span>匹配度总分</span>
            <strong>{report ? report.totalScore : "--"}</strong>
          </div>
          <div className="score-metrics">
            <Metric label="技能匹配" value={getDimensionScore(report, "技能匹配")} />
            <Metric label="经历匹配" value={getDimensionScore(report, "经历匹配")} />
            <Metric
              label="关键词覆盖"
              value={getDimensionScore(report, "关键词覆盖")}
            />
          </div>
        </section>

        <section className="insight-grid" aria-label="分析洞察">
          <InsightList title="优势" items={report?.advantages ?? []} />
          <InsightList title="主要问题" items={report?.problems ?? []} />
        </section>

        <section className="suggestion-section" aria-label="修改建议">
          <div className="section-heading">
            <WandSparkles size={20} aria-hidden="true" />
            <h2>修改建议</h2>
          </div>

          <div className="suggestion-table" role="table">
            <div className="table-row table-head" role="row">
              <span role="columnheader">原句</span>
              <span role="columnheader">问题</span>
              <span role="columnheader">建议</span>
              <span role="columnheader">修改后</span>
            </div>
            {(report?.suggestions ?? []).map((item) => (
              <div className="table-row" role="row" key={item.original}>
                <span role="cell">{item.original}</span>
                <span role="cell">{item.issue}</span>
                <span role="cell">{item.advice}</span>
                <span role="cell">{item.rewritten}</span>
              </div>
            ))}
            {!report && (
              <div className="empty-state">
                输入简历和 JD 后开始分析，这里会展示可直接替换的优化表达。
              </div>
            )}
          </div>
        </section>

        {interviewQuestions.length > 0 && (
          <section className="question-section" aria-label="面试题预测">
            <div className="section-heading">
              <Sparkles size={20} aria-hidden="true" />
              <h2>面试题预测</h2>
            </div>
            <ol>
              {interviewQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </section>
        )}

        <footer className="footer-actions" aria-label="后续操作">
          <button className="secondary-button" type="button" disabled={!report}>
            <Download size={18} aria-hidden="true" />
            导出优化版
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={!report || isGeneratingQuestions}
            onClick={handleGenerateQuestions}
          >
            {isGeneratingQuestions ? (
              <Loader2 size={18} aria-hidden="true" className="spin-icon" />
            ) : (
              <Sparkles size={18} aria-hidden="true" />
            )}
            {isGeneratingQuestions ? "生成中..." : "生成面试题"}
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled
            title="保存版本需要数据库持久化，下一阶段接入"
          >
            <Save size={18} aria-hidden="true" />
            保存版本
          </button>
        </footer>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="insight-panel">
      <h2>{title}</h2>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="placeholder">分析完成后展示{title}</p>
      )}
    </section>
  );
}

function ToastStack({
  items,
  onClose
}: {
  items: Toast[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="toast-stack" aria-live="polite" aria-label="操作提示">
      {items.map((item) => (
        <div className={`toast toast-${item.type}`} key={item.id}>
          {item.type === "error" ? (
            <AlertCircle size={18} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={18} aria-hidden="true" />
          )}
          <span>{item.message}</span>
          <button type="button" onClick={() => onClose(item.id)}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

function getDimensionScore(report: MatchReport | null, name: string) {
  return (
    report?.dimensions.find((dimension) => dimension.name === name)?.score ?? "--"
  );
}
