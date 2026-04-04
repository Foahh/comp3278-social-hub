import { useMemo } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Analytics as AnalyticsIcon } from "pixelarticons/react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/8bit/chart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Skeleton } from "@/components/ui/8bit/skeleton"
import { useAnalytics } from "@/lib/api/hooks/useAnalytics"

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
})

type DayCountRow = { date: string; count: number }

function toCumulative(rows: DayCountRow[] | undefined): DayCountRow[] {
  if (!rows?.length) return []
  let sum = 0
  return rows.map((r) => {
    sum += r.count
    return { date: r.date, count: sum }
  })
}

const cumulativePostsChartConfig: ChartConfig = {
  count: { label: "Total posts", color: "var(--chart-1)" },
}

const cumulativeLikesChartConfig: ChartConfig = {
  count: { label: "Total likes", color: "var(--chart-2)" },
}

const dailyPostsChartConfig: ChartConfig = {
  count: { label: "Posts", color: "var(--chart-1)" },
}

const dailyLikesChartConfig: ChartConfig = {
  count: { label: "Likes", color: "var(--chart-2)" },
}

function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics()

  const postsCumulative = useMemo(
    () => toCumulative(data?.posts_over_time),
    [data?.posts_over_time]
  )
  const likesCumulative = useMemo(
    () => toCumulative(data?.likes_over_time),
    [data?.likes_over_time]
  )

  if (isError) {
    return (
      <p className="px-6 text-muted-foreground">
        Failed to load analytics. Try refreshing the page.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        <AnalyticsIcon className="size-7 shrink-0" aria-hidden />
        Analytics
      </h1>

      {/* Top 10 Most Liked Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Liked Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-4 pb-2 font-medium">#</th>
                  <th className="pr-4 pb-2 font-medium">Post</th>
                  <th className="pr-4 pb-2 font-medium">Author</th>
                  <th className="pb-2 text-right font-medium">Likes</th>
                </tr>
              </thead>
              <tbody>
                {(data?.top_posts.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No data yet.
                    </td>
                  </tr>
                )}
                {data?.top_posts.map((post, i) => (
                  <tr key={post.post_id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="max-w-xs py-2 pr-4">
                      <Link
                        to="/post/$id"
                        params={{ id: String(post.post_id) }}
                        className="line-clamp-1 hover:underline"
                      >
                        {post.excerpt || (
                          <span className="text-muted-foreground italic">
                            [image post]
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        to="/user/$username"
                        params={{ username: post.username }}
                        className="hover:underline"
                      >
                        @{post.username}
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {post.like_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Top 10 Most Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-4 pb-2 font-medium">#</th>
                  <th className="pr-4 pb-2 font-medium">User</th>
                  <th className="pr-4 pb-2 font-medium">Name</th>
                  <th className="pr-4 pb-2 text-right font-medium">Posts</th>
                  <th className="pb-2 text-right font-medium">Total Likes</th>
                </tr>
              </thead>
              <tbody>
                {(data?.top_users.length ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No data yet.
                    </td>
                  </tr>
                )}
                {data?.top_users.map((user, i) => (
                  <tr key={user.username} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-4">
                      <Link
                        to="/user/$username"
                        params={{ username: user.username }}
                        className="hover:underline"
                      >
                        @{user.username}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{user.name}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {user.post_count}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {user.total_likes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Cumulative posts */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Posts (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ChartContainer
              config={cumulativePostsChartConfig}
              className="h-48 w-full"
            >
              <AreaChart data={postsCumulative}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Cumulative likes */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Likes (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ChartContainer
              config={cumulativeLikesChartConfig}
              className="h-48 w-full"
            >
              <AreaChart data={likesCumulative}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Daily posts */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Posts (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ChartContainer
              config={dailyPostsChartConfig}
              className="h-48 w-full"
            >
              <AreaChart data={data?.posts_over_time ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Daily likes */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Likes (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ChartContainer
              config={dailyLikesChartConfig}
              className="h-48 w-full"
            >
              <AreaChart data={data?.likes_over_time ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
