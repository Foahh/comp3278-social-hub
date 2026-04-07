export const UI_FONT_STORAGE_KEY = "ui-font"

export type UiFont = "monocraft" | "inter"

export function setUiFontOnDocument(font: UiFont) {
  const root = document.documentElement
  if (font === "inter") {
    root.dataset.uiFont = "inter"
  } else {
    delete root.dataset.uiFont
  }
}

export function applyUiFont(font: UiFont) {
  setUiFontOnDocument(font)
  localStorage.setItem(UI_FONT_STORAGE_KEY, font)
}

export function readStoredUiFont(): UiFont {
  try {
    const value = localStorage.getItem(UI_FONT_STORAGE_KEY)
    return value === "inter" ? "inter" : "monocraft"
  } catch {
    return "monocraft"
  }
}
