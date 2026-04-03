import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/8bit/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/8bit/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu"
import { Separator } from "@/components/ui/8bit/separator"
import { PenSquare, Rss } from "pixelarticons/react"
import { SearchBar } from "./SearchBar"
import { useAuth } from "@/context/AuthContext"

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex shrink-0 flex-col bg-background">
      <div className="flex h-14 w-full items-center gap-3 px-4 lg:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
        >
          <Rss className="size-5" />
          <span className="hidden sm:inline">SocialHub</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <SearchBar />

          {!isLoading && user && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              bitBorder="thin"
              className="h-8 w-8"
              aria-label="New post"
            >
              <Link to="/create">
                <PenSquare className="size-4" />
              </Link>
            </Button>
          )}

          {!isLoading && !user && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login" search={{}}>Sign in</Link>
              </Button>
              <Button asChild size="sm" bitBorder="thin">
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}

          {!isLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-8">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    )}
                    <AvatarFallback>{user.name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/user/$username" params={{ username: user.username }}>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void logout()}
                  className="text-destructive focus:text-destructive"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <Separator orientation="horizontal" />
    </header>
  )
}
