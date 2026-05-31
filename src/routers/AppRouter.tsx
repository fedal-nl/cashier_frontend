import { Routes, Route } from 'react-router-dom'
import Login from "../pages/Login"
import Cashier from "../pages/Cashier"
import Orders from "../pages/Orders"
import AppNavbar from "../components/layout/AppNavBar"

export default function AppRouter() {
  return (
    <>
      <AppNavbar />

      <Routes>
        <Route path="/" element={<Cashier />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </>
  )
}