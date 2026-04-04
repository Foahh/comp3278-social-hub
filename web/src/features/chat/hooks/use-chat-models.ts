import { useEffect, useMemo, useState } from "react"
import client from "@/lib/api/client"
import type { WebsiteChatModel } from "../types"

export function useChatModels() {
  const [chatModels, setChatModels] = useState<WebsiteChatModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data, error } = await client.GET("/api/config")
      if (cancelled || error || !data) return
      const raw = data as {
        chat?: { models?: WebsiteChatModel[]; defaultModel?: string | null }
      }
      const models = raw.chat?.models ?? []
      const def = raw.chat?.defaultModel ?? models[0]?.id ?? null
      setChatModels(models)
      setSelectedModelId(def)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const chatMetadata = useMemo(() => {
    if (!selectedModelId || !chatModels.some((m) => m.id === selectedModelId))
      return undefined
    return { model: selectedModelId }
  }, [chatModels, selectedModelId])

  const providerHeadings = useMemo(
    () => [...new Set(chatModels.map((m) => m.provider))],
    [chatModels]
  )

  const selectedModel = chatModels.find((m) => m.id === selectedModelId)

  return {
    chatModels,
    selectedModelId,
    setSelectedModelId,
    selectedModel,
    chatMetadata,
    providerHeadings,
  }
}
