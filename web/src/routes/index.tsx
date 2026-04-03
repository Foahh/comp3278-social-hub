import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs"
import { Skeleton } from "@/components/ui/8bit/skeleton"
import { PostList } from "@/components/PostList"
import { useFeed } from "@/lib/api/hooks/usePosts"
import type { components } from "@/lib/api/schema"

export const Route = createFileRoute("/")({
  component: FeedPage,
})

type FeedSort = components["schemas"]["FeedSort"]

function FeedPage() {
  const [sort, setSort] = useState<FeedSort>("latest")
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } = useFeed(sort)

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <Tabs value={sort} onValueChange={(v) => setSort(v as FeedSort)}>
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <PostList
          pages={data?.pages ?? []}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
