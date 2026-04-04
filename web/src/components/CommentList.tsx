import { useState } from "react"
import { Send } from "pixelarticons/react"
import { Button } from "@/components/ui/8bit/button"
import { Textarea } from "@/components/ui/8bit/textarea"
import { Skeleton } from "@/components/ui/8bit/skeleton"
import { CommentItem } from "./CommentItem"
import { useComments, useCreateComment } from "@/lib/api/hooks/useComments"
import { useAuth } from "@/context/AuthContext"
import { appConstants } from "@/lib/appConstants"

export function CommentList({
  postId,
  commentCount,
}: {
  postId: number
  commentCount?: number
}) {
  const { user } = useAuth()
  const { data: comments, isLoading } = useComments(postId)
  const create = useCreateComment(postId)
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)
    create.mutate(
      { content: text.trim() },
      {
        onSuccess: () => {
          setText("")
          setError(null)
        },
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-lg font-semibold">
        Comments
        {commentCount !== undefined ? ` (${commentCount})` : null}
      </h2>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading &&
        comments?.map((c) => <CommentItem key={c.comment_id} comment={c} />)}

      {!isLoading && comments?.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No comments yet.
        </p>
      )}

      {user && (
        <div className="sticky bottom-0 z-10 -mx-[0.125rem] mt-10 w-[calc(100%+0.25rem)] max-w-none bg-background/95 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <form onSubmit={handleSubmit} className="space-y-2 px-[0.125rem]">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
              maxLength={appConstants.maxCommentLength}
              rows={2}
            />
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {text.length}/{appConstants.maxCommentLength}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={create.isPending || !text.trim()}
              >
                <Send className="size-4 shrink-0" aria-hidden />
                {create.isPending ? "Posting…" : "Post"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </div>
      )}
    </div>
  )
}
