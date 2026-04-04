import { MessageResponse } from "@/components/ai/message"
import type { CardChunk } from "../types"

interface CardDisplayProps {
  card: CardChunk
}

export function CardDisplay({ card }: CardDisplayProps) {
  return (
    <div className="my-2 rounded-none border-[0.125rem] border-foreground bg-muted/10 px-3 py-2 dark:border-ring">
      {card.title && <p className="retro text-sm font-medium">{card.title}</p>}
      {card.description && (
        <p className="retro mt-0.5 text-xs text-muted-foreground">
          {card.description}
        </p>
      )}
      {card.content && (
        <div className="retro mt-1 text-sm">
          <MessageResponse>{card.content}</MessageResponse>
        </div>
      )}
    </div>
  )
}
