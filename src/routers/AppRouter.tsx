import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import Login from "../pages/Login"
import Cashier from "../pages/Cashier"
import Orders from "../pages/Orders"
import OrderDetails from "../pages/OrderDetails"
import Customers from "../pages/Customers"
import Reports from "../pages/Reports"
import OrderLogs from "../pages/OrderLogs"
import Home from "../pages/Home"
import AppNavbar from "../components/layout/AppNavBar"
import { useAuth } from "../context/useAuth"

function ProtectedRoute({
  children,
  requireReports = false,
  requireOrderLogs = false,
}: {
  children: React.ReactNode
  requireReports?: boolean
  requireOrderLogs?: boolean
}) {
  const {
    isAuthenticated,
    isLoading,
    canViewReports,
    canViewOrderLogs,
  } =
    useAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireReports && !canViewReports) {
    return <Navigate to="/" replace />
  }

  if (requireOrderLogs && !canViewOrderLogs) {
    return <Navigate to="/" replace />
  }

  return children
}

function LoginRoute() {
  const { isAuthenticated, isLoading } =
    useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Login />
}

export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {isAuthenticated && <AppNavbar />}

      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute>
              <Cashier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requireReports>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-logs"
          element={
            <ProtectedRoute requireOrderLogs>
              <OrderLogs />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
