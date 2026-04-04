import { http, HttpResponse } from "msw"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { server } from "@/test/server"
import { makeTestQueryClient } from "@/test/wrappers"
import { useAnalytics } from "../useAnalytics"
import type { components } from "@/lib/api/schema"
import type { ReactNode } from "react"

type AnalyticsResponse = components["schemas"]["AnalyticsResponse"]

const mockAnalytics: AnalyticsResponse = {
  top_posts: [
    { post_id: 1, username: "alice", excerpt: "Hello world", like_count: 42 },
  ],
  top_users: [
    { username: "alice", name: "Alice", post_count: 15, total_likes: 99 },
  ],
  posts_over_time: [{ date: "2026-03-05", count: 3 }],
  likes_over_time: [{ date: "2026-03-05", count: 7 }],
}

function wrapper({ children }: { children: ReactNode }) {
  const [qc] = useState(() => makeTestQueryClient())
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe("useAnalytics", () => {
  it("fetches analytics data", async () => {
    server.use(
      http.get("/api/analytics", () => HttpResponse.json(mockAnalytics))
    )
    const { result } = renderHook(() => useAnalytics(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.top_posts).toHaveLength(1)
    expect(result.current.data?.top_posts[0].like_count).toBe(42)
    expect(result.current.data?.posts_over_time[0].count).toBe(3)
  })

  it("exposes isLoading while fetching", async () => {
    server.use(
      http.get("/api/analytics", () => HttpResponse.json(mockAnalytics))
    )
    const { result } = renderHook(() => useAnalytics(), { wrapper })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
