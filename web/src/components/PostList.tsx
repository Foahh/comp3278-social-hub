import { ChevronDown } from "pixelarticons/react"
import { Button } from "@/components/ui/8bit/button"
import { Skeleton } from "@/components/ui/8bit/skeleton"
import { PostCard } from "./PostCard"
import type { components } from "@/lib/api/schema"

interface Props {
  pages: Array<{ posts: components["schemas"]["PostResponse"][] }>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  isLoading?: boolean
  emptyMessage?: string
}

export function PostList({
  pages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  emptyMessage,
}: Props) {
  const posts = pages.flatMap((p) => p.posts)

  const defaultEmpty =
    "Nothing here yet. When people post, you'll see it here—or share something to get started."

  if (posts.length === 0 && !isFetchingNextPage && !isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage ?? defaultEmpty}
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
            <ChevronDown className="size-4 shrink-0" aria-hidden />
            Load more posts
          </Button>
        </div>
      )}
    </div>
  )
}
