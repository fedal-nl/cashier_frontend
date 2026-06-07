import { Navbar, Nav, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import LogoutButton from "../LogoutButton"
import { useAuth } from "../../context/authContext.tsx"

export default function AppNavbar() {
  const { isAuthenticated } = useAuth()

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/home">
          كاشير مأكولات أهلنا
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto gap-4">

            <Nav.Link as={Link} to="/">
              الرئيسية
            </Nav.Link>

            {!isAuthenticated && (
              <Nav.Link as={Link} to="/login">
                تسجيل الدخول
              </Nav.Link>
            )}

            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/cashier">
                  الكاشير
                </Nav.Link>

                <Nav.Link as={Link} to="/orders">
                  الطلبات
                </Nav.Link>

                <Nav.Link as={Link} to="/customers">
                  العملاء
                </Nav.Link>

                <Nav.Link as={Link} to="/reports">
                  التقارير
                </Nav.Link>

                <LogoutButton />
              </>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
