import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Rss, PenSquareIcon } from "lucide-react"
import { SearchBar } from "./SearchBar"
import { useAuth } from "@/context/AuthContext"

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b bg-background">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
        >
          <Rss className="size-5" />
          <span className="hidden sm:inline">SocialHub</span>
        </Link>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <div className="flex flex-1 items-center justify-end gap-2">
          <SearchBar />

          {!isLoading && user && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="New post">
              <Link to="/create">
                <PenSquareIcon className="size-4" />
              </Link>
            </Button>
          )}

          {!isLoading && !user && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
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
                      <AvatarImage src={user.avatar_url} alt={user.username} />
                    )}
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
    </header>
  )
}
