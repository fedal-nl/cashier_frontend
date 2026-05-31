import api from "./api"

export async function login(
  username: string,
  password: string
) {
  const response = await api.post(
    "/auth/login/",
    {
      username,
      password,
    }
  )
  console.log("Login response:", response)

  return response.data
}

export async function logout() {
  const response = await api.post(
    "/auth/logout/"
  )
  console.log("Logout response:", response)
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get(
    "/auth/me/"
  )

  console.log("Get current user response:", response)
  return response.data
}