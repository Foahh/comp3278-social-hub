import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/8bit/button"
import { Textarea } from "@/components/ui/8bit/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/8bit/card"
import { ImageUpload } from "@/components/ImageUpload"
import { useCreatePost } from "@/lib/api/hooks/usePosts"
import { appConstants } from "@/lib/appConstants"
import { toast } from "@/components/ui/8bit/toast"
import { PenSquare, Send } from "pixelarticons/react"

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
        void navigate({
          to: "/post/$id",
          params: { id: String(post.post_id) },
        })
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <form onSubmit={handleSubmit}>
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenSquare className="size-6" />
              <CardTitle className="text-xl">Create a New Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={appConstants.maxPostTextLength}
                rows={5}
                placeholder="What's on your mind?"
                className="resize-none text-lg"
              />
              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  {text.length}/{appConstants.maxPostTextLength}
                </p>
              </div>
            </div>

            <div className="rounded-none border-2 border-muted-foreground bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-bold tracking-wider uppercase">
                Attachments
              </h3>
              <ImageUpload
                blobs={blobs}
                urls={urls}
                onBlobsChange={setBlobs}
                onUrlsChange={setUrls}
              />
            </div>

            {contentError && (
              <p className="text-sm font-bold text-destructive">
                {contentError}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={createPost.isPending}
            >
              <Send className="size-4 shrink-0" aria-hidden />
              {createPost.isPending ? "Publishing…" : "Publish Post"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
