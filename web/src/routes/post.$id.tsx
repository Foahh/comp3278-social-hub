import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Delete } from "pixelarticons/react"
import { Button } from "@/components/ui/8bit/button"
import { Skeleton } from "@/components/ui/8bit/skeleton"
import { PostCard } from "@/components/PostCard"
import { CommentList } from "@/components/CommentList"
import { usePost, useDeletePost } from "@/lib/api/hooks/usePosts"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/8bit/toast"

export const Route = createFileRoute("/post/$id")({
  component: PostDetailPage,
})

function PostDetailPage() {
  const { id } = Route.useParams()
  const postId = parseInt(id, 10)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading, isError } = usePost(postId)
  const deletePost = useDeletePost()

  const handleDelete = () => {
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("Post removed.")
        void navigate({ to: "/" })
      },
      onError: () => toast.error("Failed to delete post."),
    })
  }

  if (!Number.isInteger(postId)) {
    return (
      <p className="px-6 text-muted-foreground">
        This link doesn't point to a valid post.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (isError || !post) {
    return (
      <p className="px-6 text-muted-foreground">
        We couldn't find that post. It may have been deleted.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <PostCard post={post} hidePostLink />

      {user?.user_id === post.user_id && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            <Delete className="size-4 shrink-0" aria-hidden />
            {deletePost.isPending ? "Removing…" : "Delete post"}
          </Button>
        </div>
      )}

      <CommentList postId={postId} commentCount={post.comment_count} />
    </div>
  )
}
