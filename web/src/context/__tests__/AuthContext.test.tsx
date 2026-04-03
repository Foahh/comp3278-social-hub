import { http, HttpResponse } from "msw"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QueryClientProvider } from "@tanstack/react-query"
import { server } from "@/test/server"
import { makeTestQueryClient } from "@/test/wrappers"
import { AuthProvider, useAuth } from "../AuthContext"
import type { components } from "@/lib/api/schema"

type AuthResponse = components["schemas"]["AuthResponse"]

describe("AuthContext", () => {
  it("returns null user on 401", async () => {
    const qc = makeTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it("returns user data on 200", async () => {
    const mockUser: AuthResponse = {
      user_id: 1,
      username: "alice",
      name: "Alice",
      avatar_url: null,
    }
    server.use(http.get("/api/auth/me", () => HttpResponse.json(mockUser)))
    const qc = makeTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toEqual(mockUser)
  })
})
