import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ImageUpload } from "../ImageUpload"

describe("ImageUpload", () => {
  it("rejects files over 5 MB with an inline error message", async () => {
    const user = userEvent.setup()
    const onBlobsChange = vi.fn()
    render(
      <ImageUpload
        blobs={[]}
        urls={[]}
        onBlobsChange={onBlobsChange}
        onUrlsChange={vi.fn()}
      />
    )

    const bigFile = new File(["x".repeat(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    })
    Object.defineProperty(bigFile, "size", { value: 6 * 1024 * 1024 })

    await user.upload(screen.getByTestId("blob-input"), bigFile)

    expect(screen.getByText(/exceeds 5 MB/i)).toBeTruthy()
    expect(onBlobsChange).not.toHaveBeenCalled()
  })

  it("rejects unsupported MIME types", async () => {
    const user = userEvent.setup()
    const onBlobsChange = vi.fn()
    render(
      <ImageUpload
        blobs={[]}
        urls={[]}
        onBlobsChange={onBlobsChange}
        onUrlsChange={vi.fn()}
      />
    )

    const svgFile = new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" })
    await user.upload(screen.getByTestId("blob-input"), svgFile)

    expect(screen.getByText(/unsupported/i)).toBeTruthy()
    expect(onBlobsChange).not.toHaveBeenCalled()
  })

  it("rejects URLs that do not start with http", async () => {
    const user = userEvent.setup()
    const onUrlsChange = vi.fn()
    render(
      <ImageUpload
        blobs={[]}
        urls={[]}
        onBlobsChange={vi.fn()}
        onUrlsChange={onUrlsChange}
      />
    )

    await user.type(
      screen.getByTestId("url-input"),
      "ftp://example.com/img.jpg"
    )
    await user.click(screen.getByRole("button", { name: /add/i }))

    expect(screen.getByText(/URL must start with http/i)).toBeTruthy()
    expect(onUrlsChange).not.toHaveBeenCalled()
  })
})
