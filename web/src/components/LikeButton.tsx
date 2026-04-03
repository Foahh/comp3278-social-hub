import { Heart } from "pixelarticons/react"
import { Button } from "@/components/ui/8bit/button"
import { cn } from "@/lib/utils"
import { useToggleLike } from "@/lib/api/hooks/useLikes"
import { useAuth } from "@/context/AuthContext"
import type { components } from "@/lib/api/schema"

type Post = Pick<
  components["schemas"]["PostResponse"],
  "post_id" | "liked_by_me" | "like_count"
>

export function LikeButton({ post }: { post: Post }) {
  const { user } = useAuth()
  const toggle = useToggleLike(post.post_id)

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 px-2"
      disabled={!user || toggle.isPending}
      onClick={() => toggle.mutate()}
      aria-label={post.liked_by_me ? "Unlike" : "Like"}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          post.liked_by_me && "fill-rose-500 text-rose-500",
        )}
      />
      <span className="text-xs tabular-nums">{post.like_count}</span>
    </Button>
  )
}
