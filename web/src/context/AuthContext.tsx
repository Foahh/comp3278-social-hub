import { createContext, useContext } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import client from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

type User = components["schemas"]["AuthResponse"]

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/auth/me")
      if (error) return null
      return data ?? null
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const logout = async () => {
    await client.POST("/api/auth/logout")
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
