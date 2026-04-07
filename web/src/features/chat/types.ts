export interface DataframeChunk {
  id: string
  data: Record<string, unknown>[]
  columns: string[]
  title?: string
  description?: string
  /** Present when results come from run_sql (server adds this). */
  sql?: string
}

export interface NotificationChunk {
  id: string
  message: string
  level: string
}

export interface CardChunk {
  id: string
  title?: string
  content?: string
  status?: string
  description?: string
  icon?: string
}

export interface UserMsg {
  id: string
  role: "user"
  content: string
}

export interface AssistantMsg {
  id: string
  role: "assistant"
  text: string
  dataframes: DataframeChunk[]
  notifications: NotificationChunk[]
  cards: CardChunk[]
  status?: string
  statusDetail?: string
  isStreaming: boolean
}

export type ChatMsg = UserMsg | AssistantMsg

export interface WebsiteChatModel {
  id: string
  name: string
  provider: string
}
