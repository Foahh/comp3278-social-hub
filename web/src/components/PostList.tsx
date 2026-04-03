import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "./PostCard"
import type { components } from "@/lib/api/schema"

interface Props {
  pages: Array<{ posts: components["schemas"]["PostResponse"][] }>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function PostList({ pages, hasNextPage, isFetchingNextPage, fetchNextPage }: Props) {
  const posts = pages.flatMap((p) => p.posts)

  if (posts.length === 0 && !isFetchingNextPage) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No posts yet. Be the first!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.post_id} post={post} />
      ))}

      {isFetchingNextPage && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={fetchNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
