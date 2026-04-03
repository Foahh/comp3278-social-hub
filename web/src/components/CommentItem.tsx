import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { components } from "@/lib/api/schema"

type CommentResponse = components["schemas"]["CommentResponse"]

export function CommentItem({ comment }: { comment: CommentResponse }) {
  return (
    <div className="flex gap-3 py-3">
      <Link to="/user/$username" params={{ username: comment.username }} className="shrink-0">
        <Avatar className="size-8">
          {comment.avatar_url && (
            <AvatarImage src={comment.avatar_url} alt={comment.username} />
          )}
          <AvatarFallback>{comment.username[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            to="/user/$username"
            params={{ username: comment.username }}
            className="text-sm font-medium hover:underline"
          >
            {comment.username}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  )
}
