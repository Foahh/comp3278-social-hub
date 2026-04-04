import { Check, Copy } from "pixelarticons/react"
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { type BundledLanguage, codeToHtml, type ShikiTransformer } from "shiki"
import { Button } from "@/components/ui/8bit/button"
import { cn } from "@/lib/utils"

import "@/components/ui/8bit/styles/retro.css"

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string
  language: BundledLanguage
  showLineNumbers?: boolean
}

interface CodeBlockContextType {
  code: string
}

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
})

const lineNumberTransformer: ShikiTransformer = {
  name: "line-numbers",
  line(node, line) {
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: {
        className: [
          "inline-block",
          "min-w-10",
          "mr-4",
          "text-right",
          "select-none",
          "text-muted-foreground",
        ],
      },
      children: [{ type: "text", value: String(line) }],
    })
  },
}

export async function highlightCode(
  code: string,
  language: BundledLanguage,
  showLineNumbers = false
) {
  const transformers: ShikiTransformer[] = showLineNumbers
    ? [lineNumberTransformer]
    : []

  return await Promise.all([
    codeToHtml(code, {
      lang: language,
      theme: "one-light",
      transformers,
    }),
    codeToHtml(code, {
      lang: language,
      theme: "one-dark-pro",
      transformers,
    }),
  ])
}

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) => {
  const [html, setHtml] = useState<string>("")
  const [darkHtml, setDarkHtml] = useState<string>("")
  const mounted = useRef(false)

  useEffect(() => {
    highlightCode(code, language, showLineNumbers).then(([light, dark]) => {
      if (!mounted.current) {
        setHtml(light)
        setDarkHtml(dark)
        mounted.current = true
      }
    })

    return () => {
      mounted.current = false
    }
  }, [code, language, showLineNumbers])

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-none border-[0.125rem] border-foreground bg-background text-foreground dark:border-ring",
          className
        )}
        {...props}
      >
        <div className="relative">
          <div
            className="retro overflow-auto dark:hidden [&_code]:font-mono [&_code]:text-sm [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-sm [&>pre]:text-foreground!"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div
            className="retro hidden overflow-auto dark:block [&_code]:font-mono [&_code]:text-sm [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-sm [&>pre]:text-foreground!"
            dangerouslySetInnerHTML={{ __html: darkHtml }}
          />
          {children && (
            <div className="absolute top-2 right-2 flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </CodeBlockContext.Provider>
  )
}

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const { code } = useContext(CodeBlockContext)

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"))
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      onCopy?.()
      setTimeout(() => setIsCopied(false), timeout)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const Icon = isCopied ? Check : Copy

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={copyToClipboard}
      size="icon-sm"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon className="size-3.5" />}
    </Button>
  )
}

/** Demo component for preview */
export default function CodeBlockDemo() {
  const code = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example React component.</p>
    </div>
  );
}`

  return (
    <div className="w-full max-w-2xl p-6">
      <CodeBlock code={code} language="jsx">
        <CodeBlockCopyButton
          onCopy={() => console.log("Copied code to clipboard")}
          onError={() => console.error("Failed to copy code to clipboard")}
        />
      </CodeBlock>
    </div>
  )
}
