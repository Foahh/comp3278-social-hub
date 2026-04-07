import { describe, expect, it } from "vitest"
import { parseApiDate } from "../datetime"

describe("parseApiDate", () => {
  it("treats backend timestamps without timezone as UTC", () => {
    expect(parseApiDate("2026-04-05T00:00:00").toISOString()).toBe(
      "2026-04-05T00:00:00.000Z"
    )
  })

  it("supports MySQL DATETIME strings with a space separator", () => {
    expect(parseApiDate("2026-04-05 00:00:00").toISOString()).toBe(
      "2026-04-05T00:00:00.000Z"
    )
  })

  it("preserves timestamps that already include timezone information", () => {
    expect(parseApiDate("2026-04-05T00:00:00+08:00").toISOString()).toBe(
      "2026-04-04T16:00:00.000Z"
    )
  })
})
