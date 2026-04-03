import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type FeedSort = components["schemas"]["FeedSort"]

export function useFeed(sort: FeedSort) {
  return useInfiniteQuery({
    queryKey: ["posts", "feed", sort],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await client.GET("/api/posts", {
        params: {
          query: {
            sort,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        },
      })
      if (error) throw new Error("Failed to fetch feed")
      return data!
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 1000 * 15,
  })
}

export function usePost(postId: number) {
  return useQuery({
    queryKey: ["posts", postId],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/posts/{post_id}", {
        params: { path: { post_id: postId } },
      })
      if (error) throw new Error("Post not found")
      return data!
    },
    staleTime: 1000 * 30,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    // Raw fetch is used here because openapi-fetch does not support multipart/form-data (FormData) uploads.
    // Credentials and base URL are handled manually.
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail ?? "Failed to create post")
      }
      return response.json() as Promise<components["schemas"]["PostResponse"]>
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await client.DELETE("/api/posts/{post_id}", {
        params: { path: { post_id: postId } },
      })
      if (error) throw new Error("Failed to delete post")
    },
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: ["posts", postId] })
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] })
    },
  })
}
