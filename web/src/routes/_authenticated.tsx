import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate({ to: "/login", search: { redirect: pathname } })
    }
  }, [isLoading, user, navigate, pathname])

  if (isLoading) return null
  if (!user) return null
  return <Outlet />
}
