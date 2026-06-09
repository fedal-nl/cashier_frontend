import { Routes, Route } from 'react-router-dom'
import Login from "../pages/Login"
import Cashier from "../pages/Cashier"
import Orders from "../pages/Orders"
import OrderDetails from "../pages/OrderDetails"
import Customers from "../pages/Customers"
import Reports from "../pages/Reports"
import Home from "../pages/Home"
import AppNavbar from "../components/layout/AppNavBar"

export default function AppRouter() {
  return (
    <>
      <AppNavbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </>
  )
}
