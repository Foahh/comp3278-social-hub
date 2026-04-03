import createClient from "openapi-fetch"
import type { paths } from "./schema"

const client = createClient<paths>({
  baseUrl: "/",
  credentials: "include",
  // Use a lazy fetch wrapper so MSW's globalThis.fetch patch is respected in tests
  fetch: (...args) => globalThis.fetch(...args),
})

export default client
