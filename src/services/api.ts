import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
})

let csrfToken: string | null = null

function isUnsafeMethod(method?: string) {
  return ["post", "put", "patch", "delete"].includes(
    method?.toLowerCase() ?? ""
  )
}

export async function refreshCsrfToken() {
  const response = await api.get(
    "/auth/csrf/"
  )

  csrfToken = response.data.csrfToken
  api.defaults.headers.common["X-CSRFToken"] = csrfToken

  return csrfToken
}

api.interceptors.request.use(async (config) => {
  if (
    isUnsafeMethod(config.method) &&
    !config.headers["X-CSRFToken"]
  ) {
    const token =
      csrfToken ?? await refreshCsrfToken()

    config.headers["X-CSRFToken"] = token
  }

  return config
})

export default api

export async function fetchMenu() {
  const response = await api.get(
    "/menu/menus/"
  )

  if (
    !response.data ||
    !Array.isArray(response.data)
  ) {
    throw new Error(
      "Invalid menu data"
    )
  }

  return response.data
}
