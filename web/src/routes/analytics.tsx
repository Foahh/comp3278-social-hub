import { createFileRoute, Link } from "@tanstack/react-router"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
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

const postsChartConfig: ChartConfig = {
  count: { label: "Posts", color: "hsl(var(--chart-1))" },
}

const likesChartConfig: ChartConfig = {
  count: { label: "Likes", color: "hsl(var(--chart-2))" },
}

function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics()

  if (isError) {
    return (
      <p className="px-6 text-muted-foreground">
        Failed to load analytics. Try refreshing the page.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>

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
                  <th className="pb-2 pr-4 font-medium">#</th>
                  <th className="pb-2 pr-4 font-medium">Post</th>
                  <th className="pb-2 pr-4 font-medium">Author</th>
                  <th className="pb-2 font-medium text-right">Likes</th>
                </tr>
              </thead>
              <tbody>
                {data?.top_posts.map((post, i) => (
                  <tr key={post.post_id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-4 max-w-xs">
                      <Link
                        to="/post/$id"
                        params={{ id: String(post.post_id) }}
                        className="hover:underline line-clamp-1"
                      >
                        {post.excerpt || <span className="italic text-muted-foreground">[image post]</span>}
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
                    <td className="py-2 text-right tabular-nums">{post.like_count}</td>
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
                  <th className="pb-2 pr-4 font-medium">#</th>
                  <th className="pb-2 pr-4 font-medium">User</th>
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium text-right">Posts</th>
                  <th className="pb-2 font-medium text-right">Total Likes</th>
                </tr>
              </thead>
              <tbody>
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
                    <td className="py-2 pr-4 text-right tabular-nums">{user.post_count}</td>
                    <td className="py-2 text-right tabular-nums">{user.total_likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Posts Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Posts Over Time (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ChartContainer config={postsChartConfig} className="h-48 w-full">
              <LineChart data={data?.posts_over_time ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Likes Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Likes Over Time (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ChartContainer config={likesChartConfig} className="h-48 w-full">
              <LineChart data={data?.likes_over_time ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
