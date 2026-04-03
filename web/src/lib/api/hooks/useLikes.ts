import { useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type PostResponse = components["schemas"]["PostResponse"]

export function useToggleLike(postId: number) {
  const queryClient = useQueryClient()
  const queryKey = ["posts", postId]

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await client.POST("/api/posts/{post_id}/like", {
        params: { path: { post_id: postId } },
      })
      if (error) throw new Error("Failed to toggle like")
      return data!
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PostResponse>(queryKey)
      if (previous) {
        queryClient.setQueryData<PostResponse>(queryKey, {
          ...previous,
          liked_by_me: !previous.liked_by_me,
          like_count: previous.liked_by_me
            ? previous.like_count - 1
            : previous.like_count + 1,
        })
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKey, context.previous)
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PostResponse>(queryKey, (old) =>
        old
          ? { ...old, liked_by_me: data.liked, like_count: data.like_count }
          : old
      )
    },
  })
}
