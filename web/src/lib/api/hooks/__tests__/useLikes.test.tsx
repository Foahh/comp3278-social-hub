import { http, HttpResponse } from "msw"
import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from "@tanstack/react-query"
import { server } from "@/test/server"
import { makeTestQueryClient } from "@/test/wrappers"
import { useToggleLike } from "../useLikes"
import type { components } from "@/lib/api/schema"
import type { ReactNode } from "react"

type PostResponse = components["schemas"]["PostResponse"]
type PostListResponse = components["schemas"]["PostListResponse"]

const basePost: PostResponse = {
  post_id: 1,
  user_id: 1,
  username: "alice",
  name: "Alice",
  avatar_url: null,
  text_content: "hi",
  images: [],
  like_count: 3,
  comment_count: 0,
  liked_by_me: false,
  created_at: "2026-04-04T00:00:00",
}

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useToggleLike", () => {
  it("optimistically increments like_count and sets liked_by_me", async () => {
    server.use(
      http.post("/api/posts/1/like", async () => {
        await new Promise((r) => setTimeout(r, 50))
        return HttpResponse.json({ liked: true, like_count: 4 })
      })
    )
    const qc = makeTestQueryClient()
    qc.setQueryDefaults(["posts", 1], { staleTime: Infinity, gcTime: Infinity })
    qc.setQueryData(["posts", 1], basePost)

    const { result } = renderHook(() => useToggleLike(1), {
      wrapper: makeWrapper(qc),
    })
    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      const cached = qc.getQueryData<PostResponse>(["posts", 1])
      return (cached?.like_count ?? 0) >= 4
    })

    const cached = qc.getQueryData<PostResponse>(["posts", 1])
    expect(cached?.like_count).toBe(4)
    expect(cached?.liked_by_me).toBe(true)
  })

  it("updates the post inside feed infinite cache", async () => {
    server.use(
      http.post("/api/posts/1/like", async () => {
        await new Promise((r) => setTimeout(r, 50))
        return HttpResponse.json({ liked: true, like_count: 4 })
      })
    )
    const qc = makeTestQueryClient()
    const feedKey = ["posts", "feed", "latest"] as const
    qc.setQueryDefaults(feedKey, { staleTime: Infinity, gcTime: Infinity })
    const feedData: InfiniteData<PostListResponse> = {
      pages: [{ posts: [basePost], next_cursor: null, next_cursor_likes: null }],
      pageParams: [undefined],
    }
    qc.setQueryData(feedKey, feedData)

    const { result } = renderHook(() => useToggleLike(1), {
      wrapper: makeWrapper(qc),
    })
    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      const cached = qc.getQueryData<InfiniteData<PostListResponse>>(feedKey)
      return cached?.pages[0]?.posts[0]?.like_count === 4
    })

    const cached = qc.getQueryData<InfiniteData<PostListResponse>>(feedKey)
    expect(cached?.pages[0]?.posts[0]?.like_count).toBe(4)
    expect(cached?.pages[0]?.posts[0]?.liked_by_me).toBe(true)
  })
})
