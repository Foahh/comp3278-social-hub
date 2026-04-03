import createClient from "openapi-fetch"
import type { paths } from "./schema"

const client = createClient<paths>({
  baseUrl: "/",
  credentials: "include",
})

export default client
