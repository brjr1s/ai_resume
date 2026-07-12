# AI Resume Assistant

AI Resume Assistant is a full-stack prototype for resume matching and optimization. Users can upload or paste a resume, paste a target job description, and get a structured match report with scores, strengths, problems, rewrite suggestions, and interview question predictions.

当前项目定位是 **AI 简历助手的可运行基础版本**：前端页面、后端 API、文件上传入口、JD 解析、规则版匹配分析和面试题生成已经打通；真正的 PDF/DOCX 正文解析、大模型改写、数据库持久化和导出能力还在后续阶段。

## Features

已实现：

- Resume input by text paste
- Resume file upload entry for PDF, DOC, DOCX, and TXT
- TXT upload text extraction
- Job description input and basic parsing
- Resume/JD match analysis through backend API
- Total score and dimension scores
- Strengths, problems, missing keywords, and rewrite suggestions
- Interview question generation
- Loading states, progress bar, success/error toasts
- Blue-themed responsive UI

当前限制：

- PDF/DOCX files can be uploaded, but their body text is not parsed yet.
- Analysis is rule-based, not powered by an LLM yet.
- Data is stored in memory only and will be lost after backend restart.
- Export to PDF/DOCX is not implemented yet.
- Save version is currently disabled until database persistence is added.

## Tech Stack

Frontend:

- React 19
- Vite
- TypeScript
- Lucide React
- Plain CSS

Backend:

- Node.js
- Express
- TypeScript
- Zod
- Multer
- In-memory storage

## Project Structure

```text
ai_resume/
├─ src/
│  ├─ api/
│  │  ├─ client.ts
│  │  └─ types.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ backend/
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ package.json
├─ vite.config.ts
└─ README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install dependencies

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

### Run backend

From the project root:

```bash
npm run backend:dev:3002
```

Backend health check:

```text
http://127.0.0.1:3002/api/health
```

### Run frontend

From the project root:

```bash
npm run dev -- --port 5174
```

Frontend URL:

```text
http://127.0.0.1:5174
```

The frontend API base URL defaults to:

```text
http://127.0.0.1:3002/api
```

You can override it with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:3002/api
```

## Available Scripts

Root project:

```bash
npm run dev
npm run build
npm run preview
npm run backend:dev
npm run backend:dev:3002
npm run backend:build
npm run backend:start
```

Backend project:

```bash
npm run dev
npm run dev:3002
npm run build
npm run start
```

## API Endpoints

```text
GET  /api/health
GET  /api/resumes
POST /api/resumes/text
POST /api/resumes/upload
POST /api/jobs/parse
POST /api/analysis/match
POST /api/analysis/suggestions
POST /api/interviews/questions
```

Example match request:

```bash
curl -X POST http://127.0.0.1:3002/api/analysis/match \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "我负责 React TypeScript 后台管理系统开发，参与项目性能优化，建设公共组件模块，首屏加载时间降低 30%。",
    "jdText": "岗位：前端工程师。负责 React TypeScript 项目开发，参与性能优化，熟悉 Node 和 Redis 优先。"
  }'
```

## Product Roadmap

Next implementation steps:

1. PDF/DOCX body text parsing
2. PostgreSQL persistence
3. Real LLM-powered analysis and rewrite suggestions
4. Resume version generation
5. DOCX export
6. PDF export
7. Application history and version management

## Notes

This repository is currently an MVP prototype. It is suitable for local development, feature validation, and product workflow review. Before production use, it still needs authentication, persistent storage, robust document parsing, LLM integration, rate limiting, logging, and deployment configuration.
