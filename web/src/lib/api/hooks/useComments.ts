import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type CommentResponse = components["schemas"]["CommentResponse"]
type CommentListResponse = components["schemas"]["CommentListResponse"]
type CreateCommentRequest = components["schemas"]["CreateCommentRequest"]

const COMMENT_LIMIT = 50

export function useComments(postId: number) {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const { data, error } = await client.GET(
        "/api/posts/{post_id}/comments",
        {
          params: {
            path: { post_id: postId },
            query: {
              limit: COMMENT_LIMIT,
              ...(pageParam != null ? { cursor: pageParam } : {}),
            },
          },
        }
      )
      if (error) throw new Error("Failed to fetch comments")
      return data!
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage?.next_cursor ?? undefined,
  })
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCommentRequest) => {
      const { data, error } = await client.POST(
        "/api/posts/{post_id}/comments",
        {
          params: { path: { post_id: postId } },
          body,
        }
      )
      if (error)
        throw new Error(
          (error as { detail?: string }).detail ?? "Failed to post comment"
        )
      return data!
    },
    onSuccess: (newComment: CommentResponse) => {
      queryClient.setQueryData<{ pages: CommentListResponse[] }>(
        ["comments", postId],
        (old) => {
          if (!old)
            return {
              pages: [{ comments: [newComment], next_cursor: null }],
              pageParams: [undefined],
            }
          const pages = [...old.pages]
          const last = pages[pages.length - 1]
          pages[pages.length - 1] = {
            ...last,
            comments: [...last.comments, newComment],
          }
          return { ...old, pages }
        }
      )
      queryClient.setQueryData<components["schemas"]["PostResponse"]>(
        ["posts", postId],
        (old) => (old ? { ...old, comment_count: old.comment_count + 1 } : old)
      )
    },
  })
}
