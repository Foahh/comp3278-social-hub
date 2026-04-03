import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["users", username],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/users/{username}", {
        params: { path: { username } },
      })
      if (error) throw new Error("User not found")
      return data!
    },
  })
}

export function useUpdateAvatar(username: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("avatar", file)
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/avatar`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      )
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(
          (err as { detail?: string }).detail ?? "Failed to update avatar"
        )
      }
      return response.json() as Promise<components["schemas"]["AuthResponse"]>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", username] })
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
    },
  })
}
