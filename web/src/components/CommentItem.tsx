import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
import type { components } from "@/lib/api/schema"
import { parseApiDate } from "@/lib/datetime"

type CommentResponse = components["schemas"]["CommentResponse"]

export function CommentItem({ comment }: { comment: CommentResponse }) {
  return (
    <div className="flex gap-3 py-3">
      <Link
        to="/user/$username"
        params={{ username: comment.username }}
        className="shrink-0"
      >
        <Avatar className="size-8">
          {comment.avatar_url && (
            <AvatarImage src={comment.avatar_url} alt={comment.name} />
          )}
          <AvatarFallback>
            {comment.name[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            to="/user/$username"
            params={{ username: comment.username }}
            className="text-sm hover:underline"
          >
            <span className="font-medium text-foreground/85">
              {comment.name}
            </span>{" "}
            <span className="font-normal text-muted-foreground">
              @{comment.username}
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseApiDate(comment.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  )
}
