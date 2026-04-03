import { useRef, useState, useMemo, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { appConstants } from "@/lib/appConstants"

interface Props {
  blobs: File[]
  urls: string[]
  onBlobsChange: (files: File[]) => void
  onUrlsChange: (urls: string[]) => void
}

export function ImageUpload({ blobs, urls, onBlobsChange, onUrlsChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)

  const maxBytes = appConstants.imageUploadMaxMb * 1024 * 1024
  const allowed = new Set(appConstants.allowedImageMimeTypes)

  const blobUrls = useMemo(
    () => blobs.map((f) => URL.createObjectURL(f)),
    [blobs],
  )

  // Cleanup on unmount or when blobs change
  useEffect(() => {
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [blobUrls])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const incoming = Array.from(e.target.files ?? [])
    const valid: File[] = []
    for (const f of incoming) {
      if (f.size > maxBytes) {
        setFileError(`"${f.name}" exceeds ${appConstants.imageUploadMaxMb} MB limit`)
        e.target.value = ""
        return
      }
      if (!allowed.has(f.type)) {
        setFileError(`Unsupported file type: ${f.type}`)
        e.target.value = ""
        return
      }
      valid.push(f)
    }
    onBlobsChange([...blobs, ...valid])
    e.target.value = ""
  }

  function addUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onUrlsChange([...urls, trimmed])
    setUrlInput("")
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        data-testid="blob-input"
        type="file"
        multiple
        onChange={handleFileChange}
        className="sr-only"
        id="blob-input"
      />

      {(blobs.length > 0 || urls.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {blobs.map((f, i) => (
            <div key={i} className="relative">
              <img
                src={blobUrls[i]}
                alt={f.name}
                className="h-20 w-20 rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => onBlobsChange(blobs.filter((_, j) => j !== i))}
                className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {urls.map((u, i) => (
            <div key={i} className="relative">
              <img src={u} alt="URL image" className="h-20 w-20 rounded-md object-cover" />
              <button
                type="button"
                onClick={() => onUrlsChange(urls.filter((_, j) => j !== i))}
                className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fileError && <p className="text-sm text-destructive">{fileError}</p>}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus className="mr-1 size-3" />
        Add image
      </Button>

      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste an image URL…"
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addUrl()
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrl}
          disabled={!urlInput.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
