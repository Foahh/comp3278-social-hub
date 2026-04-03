import { useRef } from "react"
import { Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { appConstants } from "@/lib/appConstants"

interface Props {
  currentUrl: string | null
  username: string
  onFileSelected: (file: File) => void
  error?: string | null
  isPending?: boolean
}

export function AvatarUpload({
  currentUrl,
  username,
  onFileSelected,
  error,
  isPending,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!appConstants.allowedImageMimeTypes.includes(file.type)) return
    if (file.size > appConstants.imageUploadMaxMb * 1024 * 1024) return
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
          {currentUrl && <AvatarImage src={currentUrl} alt={username} />}
          <AvatarFallback className="text-2xl">{username[0]?.toUpperCase() ?? "?"}</AvatarFallback>
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
