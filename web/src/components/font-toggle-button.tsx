import { useCallback, useEffect, useState } from "react"
import { CardText } from "pixelarticons/react"
import { Button } from "@/components/ui/8bit/button"
import {
  applyUiFont,
  readStoredUiFont,
  setUiFontOnDocument,
  UI_FONT_STORAGE_KEY,
  type UiFont,
} from "@/lib/ui-font"

export function FontToggleButton() {
  const [font, setFont] = useState<UiFont>(() => readStoredUiFont())

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }
      if (event.key !== UI_FONT_STORAGE_KEY) {
        return
      }
      const next: UiFont = event.newValue === "inter" ? "inter" : "monocraft"
      setUiFontOnDocument(next)
      setFont(next)
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggle = useCallback(() => {
    const next: UiFont = font === "monocraft" ? "inter" : "monocraft"
    applyUiFont(next)
    setFont(next)
  }, [font])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="mx-0 h-8 w-8 shrink-0"
      onClick={toggle}
      aria-label={
        font === "monocraft"
          ? "Switch to Inter font"
          : "Switch to Monocraft font"
      }
      title={font === "monocraft" ? "Use Inter font" : "Use Monocraft font"}
    >
      <CardText className="size-4" aria-hidden />
    </Button>
  )
}
