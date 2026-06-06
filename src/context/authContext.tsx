import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import {
  login as loginRequest,
  logout as logoutRequest,
  getCurrentUser,
} from "../services/auth"
import { refreshCsrfToken } from "../services/api"


type AuthContextType = {
  isAuthenticated: boolean
  username: string | null
  login: (
    username: string,
    password: string
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  )

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false)

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
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    )
  }

  return context
}
