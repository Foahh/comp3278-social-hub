import { useQuery } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

export type AnalyticsResponse = components["schemas"]["AnalyticsResponse"]

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/analytics", {})
      if (error) throw new Error("Failed to fetch analytics")
      return data!
    },
    staleTime: 1000 * 60,
  })
}
