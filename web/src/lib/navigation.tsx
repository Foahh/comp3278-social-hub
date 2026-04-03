import { CommandIcon, LayoutDashboardIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { FileRoutesByPath } from "@tanstack/react-router"

export type AppRouteTo = keyof FileRoutesByPath

export type NavDestination = { to: AppRouteTo; href?: never }

export type NavMainItem = { title: string; icon?: ReactNode } & NavDestination

export type NavSecondaryItem = {
  title: string
  icon: ReactNode
} & NavDestination

export const NavData: {
  navMain: NavMainItem[]
  navSecondary: NavSecondaryItem[]
} = {
  navMain: [
    {
      title: "Home",
      to: "/",
      icon: <LayoutDashboardIcon />,
    },
  ],
  navSecondary: [],
}

export { CommandIcon }
