import { Database } from "pixelarticons/react"
import type { DataframeChunk } from "../types"
import { cn } from "@/lib/utils"

interface DataTableProps {
  dataframe: DataframeChunk
}

export function DataTable({ dataframe }: DataTableProps) {
  const { columns, data, title, description } = dataframe

  return (
    <div className="my-3 overflow-hidden rounded-none border-[0.125rem] border-foreground dark:border-ring">
      {(title || description) && (
        <div className="border-b border-border bg-muted/30 px-3 py-2">
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
