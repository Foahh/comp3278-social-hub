import { useMutation, useQueryClient } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type LoginRequest = components["schemas"]["LoginRequest"]
type RegisterRequest = components["schemas"]["RegisterRequest"]

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { data, error } = await client.POST("/api/auth/login", { body })
      if (error)
        throw new Error((error as { detail?: string }).detail ?? "Login failed")
      return data!
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data, error } = await client.POST("/api/auth/register", { body })
      if (error)
        throw new Error(
          (error as { detail?: string }).detail ?? "Registration failed"
        )
      return data!
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  })
}
