# AI Resume Assistant Backend

TypeScript + Express API for the AI resume assistant.

## Run

```bash
npm install
npm run dev
```

On Windows CMD, run a fixed 3002 port with:

```bat
npm run dev:3002
```

The default API base URL is:

```text
http://127.0.0.1:3001/api
```

## Endpoints

- `GET /api/health`
- `POST /api/resumes/text`
- `POST /api/resumes/upload`
- `POST /api/jobs/parse`
- `POST /api/analysis/match`
- `POST /api/analysis/suggestions`
- `POST /api/interviews/questions`

Current implementation uses deterministic local analysis and in-memory data. The AI model, document parser, database, and object storage can be added behind the existing service layer later.
