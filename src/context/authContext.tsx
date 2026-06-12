import {
  useEffect,
  useState,
} from "react"

import { AuthContext } from "./authContextValue"
import {
  login as loginRequest,
  logout as logoutRequest,
  getCurrentUser,
} from "../services/auth"
import { refreshCsrfToken } from "../services/api"

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false)

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    username,
    setUsername,
  ] = useState<string | null>(null)

  useEffect(() => {
    refreshCsrfToken()
      .then(() => getCurrentUser())
        .then((data) => {
          if (data.authenticated) {
            setIsAuthenticated(true)
            setUsername(data.username)
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false)
        })
  }, [])

  async function login(
    username: string,
    password: string
  ) {
    await loginRequest(
      username,
      password
    )

    setIsAuthenticated(true)
    setUsername(username)
  }

  async function logout() {
    await logoutRequest()

    setIsAuthenticated(false)
    setUsername(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
