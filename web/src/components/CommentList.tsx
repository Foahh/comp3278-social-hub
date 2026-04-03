import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { CommentItem } from "./CommentItem"
import { useComments, useCreateComment } from "@/lib/api/hooks/useComments"
import { useAuth } from "@/context/AuthContext"
import { appConstants } from "@/lib/appConstants"

export function CommentList({ postId }: { postId: number }) {
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
      },
    )
  }

  return (
    <div>
      <Separator className="my-6" />
      <h2 className="mb-4 text-lg font-semibold">Comments</h2>

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
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            maxLength={appConstants.maxCommentLength}
            rows={2}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length}/{appConstants.maxCommentLength}
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={create.isPending || !text.trim()}
            >
              {create.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      )}
    </div>
  )
}
