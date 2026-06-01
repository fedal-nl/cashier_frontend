import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
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