import { http, HttpResponse } from "msw"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { server } from "@/test/server"
import { makeTestQueryClient } from "@/test/wrappers"
import { useFeed, usePost } from "../usePosts"
import type { components } from "@/lib/api/schema"
import type { ReactNode } from "react"

type PostResponse = components["schemas"]["PostResponse"]
type PostListResponse = components["schemas"]["PostListResponse"]

const mockPost: PostResponse = {
  post_id: 1,
  user_id: 1,
  username: "alice",
  name: "Alice",
  avatar_url: null,
  text_content: "Hello world",
  images: [],
  like_count: 5,
  comment_count: 2,
  liked_by_me: false,
  created_at: "2026-04-04T00:00:00",
}
const mockPage: PostListResponse = { posts: [mockPost], next_cursor: null, next_cursor_likes: null }

function wrapper({ children }: { children: ReactNode }) {
  const [qc] = useState(() => makeTestQueryClient())
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe("useFeed", () => {
  it("fetches the first page", async () => {
    server.use(http.get("/api/posts", () => HttpResponse.json(mockPage)))
    const { result } = renderHook(() => useFeed("latest"), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0].posts).toHaveLength(1)
  })

  it("hasNextPage is false when next_cursor is null", async () => {
    server.use(http.get("/api/posts", () => HttpResponse.json(mockPage)))
    const { result } = renderHook(() => useFeed("latest"), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(false)
  })
})

describe("usePost", () => {
  it("fetches a single post by id", async () => {
    server.use(http.get("/api/posts/1", () => HttpResponse.json(mockPost)))
    const { result } = renderHook(() => usePost(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.post_id).toBe(1)
  })
})
