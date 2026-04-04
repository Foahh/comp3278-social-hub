import { prepare, layout } from "@chenglou/pretext"
import type { components } from "@/lib/api/schema"

type PostResponse = components["schemas"]["PostResponse"]

const POST_TEXT_FONT = "14px Monocraft, ui-monospace, monospace"
const POST_TEXT_LINE_HEIGHT = 1.5

const CARD_CHROME_HEIGHT = 155

const TEXT_SECTION_BOTTOM_PADDING = 8

const IMAGE_SECTION_HEIGHT = 348

function getTextColumnWidth(): number {
  return Math.min(window.innerWidth - 32, 640) - 50
}

const preparedTextCache = new Map<string, ReturnType<typeof prepare>>()

export function estimatePostHeight(post: PostResponse): number {
  let height = CARD_CHROME_HEIGHT

  if (post.text_content) {
    let prepared = preparedTextCache.get(post.text_content)
    if (!prepared) {
      prepared = prepare(post.text_content, POST_TEXT_FONT, { whiteSpace: "pre-wrap" })
      preparedTextCache.set(post.text_content, prepared)
    }
    const { height: textHeight } = layout(
      prepared,
      getTextColumnWidth(),
      POST_TEXT_LINE_HEIGHT
    )
    height += textHeight + TEXT_SECTION_BOTTOM_PADDING
  }

  if (post.images.length > 0) {
    height += IMAGE_SECTION_HEIGHT
  }

  return height
}
