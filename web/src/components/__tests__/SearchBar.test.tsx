import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { SearchBar } from "../SearchBar"

const mockNavigate = vi.fn()

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe("SearchBar", () => {
  beforeEach(() => mockNavigate.mockReset())

  it("calls navigate to /chat with the trimmed query on submit", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.type(screen.getByRole("textbox"), "top posts")
    await user.keyboard("{Enter}")
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/chat",
      search: { q: "top posts" },
    })
  })

  it("navigates to /chat without q for whitespace-only input", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.type(screen.getByRole("textbox"), "   ")
    await user.keyboard("{Enter}")
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/chat",
      search: { q: undefined },
    })
  })

  it("navigates to /chat without q when submitting empty", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.click(screen.getByRole("button", { name: "Submit search" }))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/chat",
      search: { q: undefined },
    })
  })

  it("clears the input after navigating", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole("textbox")
    await user.type(input, "hello")
    await user.keyboard("{Enter}")
    expect((input as HTMLInputElement).value).toBe("")
  })
})
