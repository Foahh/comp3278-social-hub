import { Copy, Database, Terminal } from "pixelarticons/react"
import type { DataframeChunk } from "../types"
import { Action } from "@/components/ai/actions"
import { toast } from "@/components/ui/8bit/toast"
import { cn } from "@/lib/utils"

function buildTableTsv(df: DataframeChunk): string {
  if (df.columns.length === 0) return ""
  const header = df.columns.join("\t")
  const rows = df.data.map((r) =>
    df.columns.map((c) => (r[c] != null ? String(r[c]) : "")).join("\t")
  )
  return [header, ...rows].join("\n")
}

interface DataTableProps {
  dataframe: DataframeChunk
}

export function DataTable({ dataframe }: DataTableProps) {
  const { columns, data, title, description, sql } = dataframe
  const canCopySql = Boolean(sql?.trim())
  const canCopyTable = columns.length > 0
  const showCopyActions = canCopySql || canCopyTable

  const handleCopySql = () => {
    const text = sql?.trim()
    if (!text) return
    void navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied SQL")
    })
  }

  const handleCopyTableData = () => {
    const text = buildTableTsv(dataframe)
    if (!text) return
    void navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied table (TSV)")
    })
  }

  return (
    <div className="my-3 overflow-hidden rounded-none border-[0.125rem] border-foreground dark:border-ring">
      {(title || description || showCopyActions) && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
          <div className="min-w-0 flex-1">
            {title && (
              <div className="retro flex items-center gap-2 text-sm font-medium">
                <Database className="size-3.5 shrink-0 text-muted-foreground" />
                {title}
              </div>
            )}
            {description && (
              <p className="retro mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {showCopyActions && (
            <div className="flex shrink-0 items-center gap-0.5">
              {canCopySql && (
                <Action tooltip="Copy SQL" onClick={handleCopySql}>
                  <Terminal className="size-4" />
                </Action>
              )}
              {canCopyTable && (
                <Action
                  tooltip="Copy table (TSV)"
                  onClick={handleCopyTableData}
                >
                  <Copy className="size-4" />
                </Action>
              )}
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {columns.map((col) => (
                <th
                  key={col}
                  className="retro px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border last:border-0",
                  i % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="retro px-3 py-1.5 text-xs whitespace-nowrap tabular-nums"
                  >
                    {row[col] != null ? String(row[col]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="retro border-t border-border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
        {data.length} row{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
