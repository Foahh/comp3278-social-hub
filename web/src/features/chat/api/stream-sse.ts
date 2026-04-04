export async function* streamSSE(
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
  metadata?: Record<string, string>
) {
  const body: Record<string, unknown> = { message }
  if (conversationId) body.conversation_id = conversationId
  if (metadata && Object.keys(metadata).length > 0) body.metadata = metadata

  const res = await fetch("/api/vanna/v2/chat_sse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)
  if (!res.body) throw new Error("No response body")

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data: ")) continue
      const payload = trimmed.slice(6)
      if (payload === "[DONE]") return
      try {
        yield JSON.parse(payload)
      } catch {
        /* skip malformed chunks */
      }
    }
  }
}
