import { Link } from "@tanstack/react-router"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Separator } from "@/components/ui/separator"
import { NavData, CommandIcon } from "@/lib/navigation"

export function SiteHeader({ title = "Documents" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b bg-background">
      <div className="flex w-full min-w-0 items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
        >
          <CommandIcon className="size-5" />
          <span className="hidden sm:inline">Acme Inc.</span>
        </Link>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <h1 className="min-w-0 truncate text-sm font-medium sm:text-base">
          {title}
        </h1>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <NavMain items={NavData.navMain} />
          <NavSecondary items={NavData.navSecondary} />
          <NavUser
            user={{
              name: "John Doe",
              email: "john.doe@example.com",
              avatar: "https://github.com/shadcn.png",
            }}
          />
        </div>
      </div>
    </header>
  )
}
