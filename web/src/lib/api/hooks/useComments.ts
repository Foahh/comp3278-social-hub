import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type CommentResponse = components["schemas"]["CommentResponse"]
type CreateCommentRequest = components["schemas"]["CreateCommentRequest"]

export function useComments(postId: number) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/posts/{post_id}/comments", {
        params: { path: { post_id: postId } },
      })
      if (error) throw new Error("Failed to fetch comments")
      return data!
    },
  })
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCommentRequest) => {
      const { data, error } = await client.POST("/api/posts/{post_id}/comments", {
        params: { path: { post_id: postId } },
        body,
      })
      if (error) throw new Error((error as { detail?: string }).detail ?? "Failed to post comment")
      return data!
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData<CommentResponse[]>(["comments", postId], (old) =>
        old ? [...old, newComment] : [newComment],
      )
      queryClient.setQueryData<components["schemas"]["PostResponse"]>(
        ["posts", postId],
        (old) => old ? { ...old, comment_count: old.comment_count + 1 } : old,
      )
    },
  })
}
