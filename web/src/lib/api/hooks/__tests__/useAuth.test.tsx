import { http, HttpResponse } from "msw"
import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QueryClientProvider } from "@tanstack/react-query"
import { server } from "@/test/server"
import { makeTestQueryClient } from "@/test/wrappers"
import { useLogin, useRegister } from "../useAuth"
import type { components } from "@/lib/api/schema"
import type { ReactNode } from "react"

type AuthResponse = components["schemas"]["AuthResponse"]

const mockUser: AuthResponse = {
  user_id: 2, username: "bob", email: "bob@example.com", avatar_url: null,
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = makeTestQueryClient()
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe("useLogin", () => {
  it("resolves with AuthResponse on 200", async () => {
    server.use(http.post("/api/auth/login", () => HttpResponse.json(mockUser)))
    const { result } = renderHook(() => useLogin(), { wrapper })
    act(() => { result.current.mutate({ email: "bob@example.com", password: "password1" }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUser)
  })

  it("is error on 401", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 }),
      ),
    )
    const { result } = renderHook(() => useLogin(), { wrapper })
    act(() => { result.current.mutate({ email: "x@x.com", password: "wrong" }) })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain("Invalid credentials")
  })
})

describe("useRegister", () => {
  it("resolves with AuthResponse on 200", async () => {
    server.use(http.post("/api/auth/register", () => HttpResponse.json(mockUser)))
    const { result } = renderHook(() => useRegister(), { wrapper })
    act(() => {
      result.current.mutate({ username: "bob", email: "bob@example.com", password: "password1" })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
