import { LinkButton } from "@/components/ui/8bit/link-button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu"
import { Separator } from "@/components/ui/8bit/separator"
import {
  Login,
  Logout,
  PenSquare,
  Rss,
  User,
  UserPlus,
} from "pixelarticons/react"
import { SearchBar } from "./SearchBar"
import { useAuth } from "@/context/AuthContext"

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex shrink-0 flex-col bg-background">
      <div className="flex h-14 w-full items-center gap-3 px-4 lg:px-6">
        <LinkButton
          to="/"
          variant="link"
          className="h-auto min-h-0 shrink-0 gap-2 p-0 font-semibold text-foreground no-underline hover:text-foreground hover:no-underline"
        >
          <Rss className="size-5" />
          <span className="hidden sm:inline">SocialHub</span>
        </LinkButton>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <SearchBar />

          {!isLoading && user && (
            <LinkButton
              to="/create"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Create a new post"
            >
              <PenSquare className="size-4" />
            </LinkButton>
          )}

          {!isLoading && !user && (
            <>
              <LinkButton
                to="/login"
                variant="ghost"
                size="sm"
                aria-label="Sign in"
                className="max-sm:w-8 max-sm:min-w-8 max-sm:gap-0 max-sm:px-0"
              >
                <Login className="size-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Sign in</span>
              </LinkButton>
              <LinkButton
                to="/register"
                size="sm"
                aria-label="Sign up"
                className="max-sm:w-8 max-sm:min-w-8 max-sm:gap-0 max-sm:px-0"
              >
                <UserPlus className="size-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Sign up</span>
              </LinkButton>
            </>
          )}

          {!isLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <Avatar className="size-8">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    )}
                    <AvatarFallback>
                      {user.name[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LinkButton
                    to="/user/$username"
                    params={{ username: user.username }}
                    variant="ghost"
                    size="sm"
                    className="h-auto min-h-0 w-full cursor-default justify-start gap-2.5 rounded-none px-3 py-2 font-normal"
                  >
                    <User className="size-4" />
                    Profile
                  </LinkButton>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => void logout()}
                >
                  <Logout className="size-4" />
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
