import { useState, useMemo, useEffect, useCallback } from "react"
import { Cancel, Image as ImageIcon, Link, Plus } from "pixelarticons/react"
import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/8bit/input"
import { appConstants } from "@/lib/appConstants"
import { cn } from "@/lib/utils"

interface Props {
  blobs: File[]
  urls: string[]
  onBlobsChange: (files: File[]) => void
  onUrlsChange: (urls: string[]) => void
}

const sectionLabelClass =
  "mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase"

export function ImageUpload({
  blobs,
  urls,
  onBlobsChange,
  onUrlsChange,
}: Props) {
  const [urlInput, setUrlInput] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [urlBroken, setUrlBroken] = useState<Record<number, true>>({})

  const maxBytes = appConstants.imageUploadMaxMb * 1024 * 1024
  const allowed = new Set(appConstants.allowedImageMimeTypes)

  const blobUrls = useMemo(
    () => blobs.map((f) => URL.createObjectURL(f)),
    [blobs]
  )

  useEffect(() => {
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [blobUrls])

  useEffect(() => {
    setUrlBroken({})
  }, [urls])

  const tryAddFiles = useCallback(
    (incoming: File[]) => {
      setFileError(null)
      const valid: File[] = []
      for (const f of incoming) {
        if (f.size > maxBytes) {
          setFileError(
            `"${f.name}" exceeds ${appConstants.imageUploadMaxMb} MB limit`
          )
          return
        }
        if (!allowed.has(f.type)) {
          setFileError(`Unsupported file type: ${f.type}`)
          return
        }
        valid.push(f)
      }
      if (valid.length > 0) onBlobsChange([...blobs, ...valid])
    },
    [allowed, blobs, maxBytes, onBlobsChange]
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    tryAddFiles(incoming)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const incoming = Array.from(e.dataTransfer.files ?? [])
    if (incoming.length > 0) tryAddFiles(incoming)
  }

  function addUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onUrlsChange([...urls, trimmed])
    setUrlInput("")
  }

  const hasPreviews = blobs.length > 0 || urls.length > 0

  return (
    <div className="space-y-5">
      {hasPreviews && (
        <div>
          <p className={sectionLabelClass}>Preview</p>
          <ul className="flex flex-wrap gap-3" aria-label="Selected images">
            {blobs.map((f, i) => (
              <li key={`blob-${i}-${f.name}`} className="relative">
                <img
                  src={blobUrls[i]}
                  alt={f.name}
                  className="h-24 w-24 border-2 border-foreground bg-muted/40 object-cover shadow-[2px_2px_0_0_hsl(var(--foreground))] dark:border-ring dark:shadow-[2px_2px_0_0_hsl(var(--ring))]"
                />
                <button
                  type="button"
                  onClick={() => onBlobsChange(blobs.filter((_, j) => j !== i))}
                  className="text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-7 items-center justify-center border-2 border-foreground bg-destructive shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-transform hover:translate-x-px hover:translate-y-px active:translate-y-0.5 dark:border-ring"
                  aria-label={`Remove ${f.name}`}
                >
                  <Cancel className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            {urls.map((u, i) => (
              <li key={`url-${i}`} className="relative">
                {urlBroken[i] ? (
                  <div
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 border-2 border-dashed border-destructive/80 bg-destructive/10 px-1 text-center"
                    role="img"
                    aria-label="Image failed to load"
                  >
                    <ImageIcon
                      className="size-6 shrink-0 text-destructive"
                      aria-hidden
                    />
                    <span className="retro text-[0.65rem] leading-tight font-bold text-destructive">
                      Bad link
                    </span>
                  </div>
                ) : (
                  <img
                    src={u}
                    alt=""
                    className="h-24 w-24 border-2 border-foreground bg-muted/40 object-cover shadow-[2px_2px_0_0_hsl(var(--foreground))] dark:border-ring dark:shadow-[2px_2px_0_0_hsl(var(--ring))]"
                    onError={() =>
                      setUrlBroken((prev) => ({ ...prev, [i]: true }))
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => onUrlsChange(urls.filter((_, j) => j !== i))}
                  className="text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-7 items-center justify-center border-2 border-foreground bg-destructive shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-transform hover:translate-x-px hover:translate-y-px active:translate-y-0.5 dark:border-ring"
                  aria-label="Remove URL image"
                >
                  <Cancel className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fileError && (
        <div
          className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive"
          role="alert"
        >
          {fileError}
        </div>
      )}

      <div>
        <p className={sectionLabelClass} id="image-upload-device-label">
          From device
        </p>
        <div
          className={cn(
            "border-2 border-dashed border-muted-foreground bg-background/50 transition-[border-color,background-color,box-shadow]",
            isDragging &&
              "border-primary bg-primary/5 shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.2)]"
          )}
          onDragEnter={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = "copy"
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setIsDragging(false)
          }}
          onDrop={handleDrop}
        >
          <label
            htmlFor="blob-input"
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 px-4 py-8 text-center transition-colors",
              "focus-within:bg-muted/30 hover:bg-muted/40"
            )}
          >
            <span
              className="flex size-12 items-center justify-center border-2 border-foreground bg-muted/50 dark:border-ring"
              aria-hidden
            >
              <Plus className="size-6 text-foreground" />
            </span>
            <span className="retro text-sm font-bold">
              {isDragging
                ? "Drop to add"
                : "Drop images here or click to browse"}
            </span>
            <span className="text-xs text-muted-foreground">
              Up to {appConstants.imageUploadMaxMb} MB each ·{" "}
              {appConstants.allowedImageMimeTypes
                .map((m) => m.split("/")[1]?.toUpperCase() ?? m)
                .join(", ")}
            </span>
          </label>
          <input
            data-testid="blob-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            id="blob-input"
            aria-labelledby="image-upload-device-label"
          />
        </div>
      </div>

      <div>
        <p className={sectionLabelClass} id="image-upload-url-label">
          From URL
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="min-w-0 flex-1">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              className="text-sm"
              aria-labelledby="image-upload-url-label"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addUrl()
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 sm:min-w-[5.5rem]"
            onClick={addUrl}
            disabled={!urlInput.trim()}
          >
            <Link className="size-4 shrink-0" aria-hidden />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
