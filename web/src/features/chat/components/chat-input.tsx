import { Check } from "pixelarticons/react"
import { useState } from "react"
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai/model-selector"
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import type { WebsiteChatModel } from "../types"

interface ChatInputProps {
  text: string
  onTextChange: (text: string) => void
  status: "ready" | "streaming"
  onSubmit: (message: PromptInputMessage) => void
  chatModels: WebsiteChatModel[]
  selectedModelId: string | null
  selectedModel: WebsiteChatModel | undefined
  providerHeadings: string[]
  onSelectModel: (id: string) => void
}

export function ChatInput({
  text,
  onTextChange,
  status,
  onSubmit,
  chatModels,
  selectedModelId,
  selectedModel,
  providerHeadings,
  onSelectModel,
}: ChatInputProps) {
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)

  return (
    <div className="shrink-0 border-t bg-background px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <PromptInput onSubmit={onSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
            />
          </PromptInputBody>
          <PromptInputFooter className="justify-end">
            <PromptInputTools>
              {chatModels.length > 0 && selectedModel && (
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton
                      disabled={status !== "ready"}
                      type="button"
                      variant="ghost"
                    >
                      <ModelSelectorLogo provider={selectedModel.provider} />
                      <ModelSelectorName>
                        {selectedModel.name}
                      </ModelSelectorName>
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent title="Model">
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {providerHeadings.map((provider) => (
                        <ModelSelectorGroup heading={provider} key={provider}>
                          {chatModels
                            .filter((m) => m.provider === provider)
                            .map((m) => (
                              <ModelSelectorItem
                                key={m.id}
                                onSelect={() => {
                                  onSelectModel(m.id)
                                  setModelSelectorOpen(false)
                                }}
                                value={m.id}
                              >
                                <ModelSelectorLogo provider={m.provider} />
                                <ModelSelectorName>{m.name}</ModelSelectorName>
                                {selectedModelId === m.id ? (
                                  <Check className="ml-auto size-4" />
                                ) : (
                                  <div className="ml-auto size-4" />
                                )}
                              </ModelSelectorItem>
                            ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              )}
              <PromptInputSubmit
                disabled={status === "ready" && !text.trim()}
                status={status}
              />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
