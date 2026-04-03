import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type PostResponse = components["schemas"]["PostResponse"]
type PostListResponse = components["schemas"]["PostListResponse"]

type FeedInfinite = InfiniteData<PostListResponse>

function mapPostInFeed(
  data: FeedInfinite,
  postId: number,
  mapFn: (post: PostResponse) => PostResponse
): FeedInfinite {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map((p) =>
        p.post_id === postId ? mapFn(p) : p
      ),
    })),
  }
}

function optimisticLikePatch(post: PostResponse): PostResponse {
  return {
    ...post,
    liked_by_me: !post.liked_by_me,
    like_count: post.liked_by_me
      ? post.like_count - 1
      : post.like_count + 1,
  }
}

export function useToggleLike(postId: number) {
  const queryClient = useQueryClient()
  const detailKey = ["posts", postId] as const

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await client.POST("/api/posts/{post_id}/like", {
        params: { path: { post_id: postId } },
      })
      if (error) throw new Error("Failed to toggle like")
      return data!
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey })
      await queryClient.cancelQueries({
        queryKey: ["posts", "feed"],
        exact: false,
      })

      const previousPost = queryClient.getQueryData<PostResponse>(detailKey)
      if (previousPost) {
        queryClient.setQueryData<PostResponse>(
          detailKey,
          optimisticLikePatch(previousPost)
        )
      }

      const feedSnapshots = queryClient.getQueriesData<FeedInfinite>({
        queryKey: ["posts", "feed"],
        exact: false,
      })
      const previousFeeds: Array<[readonly unknown[], FeedInfinite]> = []

      for (const [key, data] of feedSnapshots) {
        if (!data) continue
        previousFeeds.push([key, data])
        queryClient.setQueryData<FeedInfinite>(key, (current) =>
          current
            ? mapPostInFeed(current, postId, optimisticLikePatch)
            : current
        )
      }

      return { previousPost, previousFeeds }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost !== undefined) {
        queryClient.setQueryData(detailKey, context.previousPost)
      }
      for (const [key, data] of context?.previousFeeds ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    onSuccess: (data) => {
      const serverPatch = (post: PostResponse): PostResponse => ({
        ...post,
        liked_by_me: data.liked,
        like_count: data.like_count,
      })

      queryClient.setQueryData<PostResponse>(detailKey, (old) =>
        old ? serverPatch(old) : old
      )

      const feeds = queryClient.getQueriesData<FeedInfinite>({
        queryKey: ["posts", "feed"],
        exact: false,
      })
      for (const [key, feedData] of feeds) {
        if (!feedData) continue
        queryClient.setQueryData<FeedInfinite>(key, (current) =>
          current
            ? mapPostInFeed(current, postId, serverPatch)
            : current
        )
      }
    },
  })
}
