import { Navbar, Nav, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import LogoutButton from "../LogoutButton"

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          كاشير مأكولات أهلنا
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto gap-4">

            <Nav.Link as={Link} to="/">
              الرئيسية
            </Nav.Link>

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

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
