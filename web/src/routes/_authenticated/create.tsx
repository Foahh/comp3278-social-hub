import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ImageUpload"
import { useCreatePost } from "@/lib/api/hooks/usePosts"
import { appConstants } from "@/lib/appConstants"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/create")({
  component: CreatePostPage,
})

function CreatePostPage() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const [text, setText] = useState("")
  const [blobs, setBlobs] = useState<File[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [contentError, setContentError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() && blobs.length === 0 && urls.length === 0) {
      setContentError("Add some text or at least one image.")
      return
    }
    setContentError(null)

    const fd = new FormData()
    if (text.trim()) fd.append("text_content", text.trim())
    blobs.forEach((f) => fd.append("images", f))
    if (urls.length > 0) fd.append("image_urls", JSON.stringify(urls))

    createPost.mutate(fd, {
      onSuccess: (post) => {
        toast.success("Post published!")
        void navigate({ to: "/post/$id", params: { id: String(post.post_id) } })
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>New post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="text">What's on your mind?</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={appConstants.maxPostTextLength}
                rows={4}
                placeholder="Share something…"
              />
              <p className="text-right text-xs text-muted-foreground">
                {text.length}/{appConstants.maxPostTextLength}
              </p>
            </div>

            <div className="space-y-1">
              <Label>Images</Label>
              <ImageUpload
                blobs={blobs}
                urls={urls}
                onBlobsChange={setBlobs}
                onUrlsChange={setUrls}
              />
            </div>

            {contentError && (
              <p className="text-sm text-destructive">{contentError}</p>
            )}

            <Button type="submit" className="w-full" disabled={createPost.isPending}>
              {createPost.isPending ? "Publishing…" : "Publish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
