import { Rss } from "lucide-react"
import type { ReactNode } from "react"
import type { FileRoutesByTo } from "@/routeTree.gen"

export type AppRouteTo = keyof FileRoutesByTo

export type NavMainItem = { title: string; icon?: ReactNode; to: AppRouteTo }

export const NavData: { navMain: NavMainItem[] } = {
  navMain: [
    { title: "Home", to: "/", icon: <Rss className="size-4" /> },
  ],
}
