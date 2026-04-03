import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Calendar, FileText, Heart } from "pixelarticons/react"
import { Card, CardContent } from "@/components/ui/8bit/card"
import { Skeleton } from "@/components/ui/8bit/skeleton"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
import { PostList } from "@/components/PostList"
import { AvatarUpload } from "@/components/AvatarUpload"
import { useUserProfile, useUpdateAvatar } from "@/lib/api/hooks/useUsers"
import { useFeed } from "@/lib/api/hooks/usePosts"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/8bit/toast"

export const Route = createFileRoute("/user/$username")({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { username } = Route.useParams()
  const { user: currentUser } = useAuth()
  const { data: profile, isLoading, isError } = useUserProfile(username)
  const updateAvatar = useUpdateAvatar(username)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const feed = useFeed("latest", username)
  const isOwner = currentUser?.username === username

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (isError || !profile) {
    return <p className="px-6 text-muted-foreground">User not found.</p>
  }

  function handleAvatarSelected(file: File) {
    setAvatarError(null)
    updateAvatar.mutate(file, {
      onSuccess: () => toast.success("Avatar updated"),
      onError: (err) => {
        setAvatarError(err.message)
        toast.error(err.message)
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      <Card className="py-0">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-6">
          {isOwner ? (
            <AvatarUpload
              currentUrl={profile.avatar_url}
              displayName={profile.name}
              username={profile.username}
              onFileSelected={handleAvatarSelected}
              error={avatarError}
              isPending={updateAvatar.isPending}
            />
          ) : (
            <Avatar className="size-24">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
              )}
              <AvatarFallback className="text-3xl">
                {profile.name[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:items-start">
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                Joined{" "}
                {formatDistanceToNow(new Date(profile.created_at), {
                  addSuffix: true,
                })}
              </span>
              <div className="flex flex-nowrap items-center justify-center gap-4 sm:justify-start">
                <span className="flex shrink-0 items-center gap-1">
                  <FileText className="size-4" />
                  {profile.post_count} posts
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Heart className="size-4" />
                  {profile.total_likes} likes received
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Posts</h2>
      <PostList
        pages={feed.data?.pages ?? []}
        hasNextPage={feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        fetchNextPage={feed.fetchNextPage}
        isLoading={feed.isLoading}
      />
    </div>
  )
}
