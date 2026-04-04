# COMP3278 Group Project - Social Hub

## Requirements

Install these first:

- **uv** — manages the Python environment and runs commands
- **Bun.js** — needed for the `web/` frontend
- **Docker + Docker Compose** — runs MySQL, MinIO, and optional full deployment

---

## Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` if needed.

### Notes

- For **local development**, the default `.env.example` values usually work.
- Services run on:
  - MySQL: `localhost:3306`
  - MinIO: `localhost:9000`

Important environment variables:

- **MySQL**: `MYSQL_*`
- **MinIO / S3**: `S3_ENDPOINT_URL`, `S3_PUBLIC_URL`, `S3_*`
- **Auth**: `JWT_SECRET`
- **OpenAI / Vanna features**: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `VANNA_CHAT_MODELS` (optional JSON model list for the chat UI and `/api/config`)
- **Chroma (Vanna memory)**: `CHROMA_PERSIST_DIRECTORY` — on-disk path for embedded ChromaDB (default `chroma_data`; ignored by git)
- **CORS**: `CORS_ORIGINS` (example: `["http://localhost:5173"]`)

---

## Local Development

### 1. Start infrastructure

Run the supporting services:

```bash
docker compose up
```

This starts MySQL and MinIO. On the **first** MySQL container start, `schema.sql` is applied automatically.

Useful URLs:

- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

---

### 2. Seed the database (optional)

With MySQL running and `.env` configured, load generated demo users, posts, images, likes, and comments:

```bash
uv sync --all-groups
uv run python scripts/seed.py
```

See `uv run python scripts/seed.py --help` other options.

---

### 3. Start backend

```bash
uv sync --all-groups
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:

- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- OpenAPI: `http://localhost:8000/openapi.json`

---

### 4. Start frontend

```bash
cd web
bun i
bun dev
```

Frontend runs at:

- `http://localhost:5173`

It proxies `/api` to the backend during development.

---

### 5. Regenerate API types (optional)

If the backend is running:

```bash
cd web
bun generate
```

This updates:

- `src/lib/api/schema.d.ts`

---

## Quality Checks

- Python tests:
  ```bash
  uv run pytest
  ```

- Python lint:
  ```bash
  uv run ruff check .
  ```

- Frontend tests:
  ```bash
  cd web && bun test
  ```

- Frontend lint:
  ```bash
  cd web && bun lint
  ```

- Frontend format:
  ```bash
  cd web && bun fmt
  ```

---

## Docker Compose Deployment

This mode:

- builds and runs the backend
- serves the built frontend with **Caddy**
- exposes the app on **port 80**
- proxies `/api/*` to the backend

### Steps

1. Make sure `.env` exists.

2. Build the frontend:

   ```bash
   cd web
   bun ci
   bun run build
   cd ..
   ```

3. Start everything:

   ```bash
   docker compose --profile deploy up --build -d
   ```

4. Open:

   - `http://localhost`

Caddy will serve the frontend and forward API requests to the backend.