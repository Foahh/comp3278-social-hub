import { useRef, useState } from "react"
import { Camera } from "pixelarticons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
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
      setLocalError(`Unsupported file type (${file.type}).`)
      e.target.value = ""
      return
    }
    if (file.size > appConstants.imageUploadMaxMb * 1024 * 1024) {
      setLocalError(
        `That file is too large. Max size is ${appConstants.imageUploadMaxMb} MB.`
      )
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
        aria-label="Change profile photo"
      >
        <Avatar
          className="size-24"
          overlay={
            <div className="flex h-full w-full items-center justify-center bg-black/40">
              <Camera className="size-6 text-white" />
            </div>
          }
        >
          {currentUrl && <AvatarImage src={currentUrl} alt={label} />}
          <AvatarFallback className="text-2xl">
            {label[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
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
