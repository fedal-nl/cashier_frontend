import { Nav } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

export default function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Nav.Link onClick={handleLogout}>
      تسجيل الخروج
    </Nav.Link>
  )
}
