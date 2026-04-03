import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "@/components/PostCard"
import { CommentList } from "@/components/CommentList"
import { usePost, useDeletePost } from "@/lib/api/hooks/usePosts"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export const Route = createFileRoute("/post/$id")({
  component: PostDetailPage,
})

function PostDetailPage() {
  const { id } = Route.useParams()
  const postId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading, isError } = usePost(postId)
  const deletePost = useDeletePost()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (isError || !post) {
    return <p className="px-6 text-muted-foreground">Post not found.</p>
  }

  function handleDelete() {
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("Post deleted")
        void navigate({ to: "/" })
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <PostCard post={post} />

      {user?.user_id === post.user_id && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            {deletePost.isPending ? "Deleting…" : "Delete post"}
          </Button>
        </div>
      )}

      <CommentList postId={postId} />
    </div>
  )
}
