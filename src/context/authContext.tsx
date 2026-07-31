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

  const [canViewReports, setCanViewReports] =
    useState(false)

  const [canViewOrderLogs, setCanViewOrderLogs] =
    useState(false)

  const [canCancelWithoutPassword, setCanCancelWithoutPassword] =
    useState(false)

  useEffect(() => {
    refreshCsrfToken()
      .then(() => getCurrentUser())
        .then((data) => {
          if (data.authenticated) {
            setIsAuthenticated(true)
            setUsername(data.username)
            setCanViewReports(Boolean(data.can_view_reports))
            setCanViewOrderLogs(Boolean(data.can_view_order_logs))
            setCanCancelWithoutPassword(Boolean(data.can_cancel_without_password))
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

    const currentUser = await getCurrentUser()

    setIsAuthenticated(true)
    setUsername(currentUser.username ?? username)
    setCanViewReports(Boolean(currentUser.can_view_reports))
    setCanViewOrderLogs(Boolean(currentUser.can_view_order_logs))
    setCanCancelWithoutPassword(
      Boolean(currentUser.can_cancel_without_password)
    )
  }

  async function logout() {
    await logoutRequest()

    setIsAuthenticated(false)
    setUsername(null)
    setCanViewReports(false)
    setCanViewOrderLogs(false)
    setCanCancelWithoutPassword(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        canViewReports,
        canViewOrderLogs,
        canCancelWithoutPassword,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
