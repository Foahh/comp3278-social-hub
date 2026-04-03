import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

export const handlers = [
  http.get("/api/auth/me", () =>
    HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
  ),
]

export const server = setupServer(...handlers)
