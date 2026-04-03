import { useRef, useState } from "react"
import { Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/8bit/avatar"
import { appConstants } from "@/lib/appConstants"

interface Props {
  currentUrl: string | null
  username: string
  displayName?: string
  onFileSelected: (file: File) => void
  error?: string | null
  isPending?: boolean
}

export function AvatarUpload({
  currentUrl,
  username,
  displayName,
  onFileSelected,
  error,
  isPending,
}: Props) {
  const label = displayName ?? username
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalError(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (!appConstants.allowedImageMimeTypes.includes(file.type)) {
      setLocalError("Unsupported file type.")
      e.target.value = ""
      return
    }
    if (file.size > appConstants.imageUploadMaxMb * 1024 * 1024) {
      setLocalError(`File exceeds ${appConstants.imageUploadMaxMb} MB limit.`)
      e.target.value = ""
      return
    }
    onFileSelected(file)
    e.target.value = ""
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className="group relative disabled:opacity-50"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="Change avatar"
      >
        <Avatar className="size-24">
          {currentUrl && <AvatarImage src={currentUrl} alt={label} />}
          <AvatarFallback className="text-2xl">{label[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-6 text-white" />
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={appConstants.allowedImageMimeTypes.join(",")}
        onChange={handleChange}
        className="sr-only"
      />
      {(localError ?? error) && (
        <p className="text-xs text-destructive">{localError ?? error}</p>
      )}
    </div>
  )
}
