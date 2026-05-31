import { Navbar, Nav, Container } from "react-bootstrap"
import { Link } from "react-router-dom"

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>

        <Navbar.Brand as={Link} to="/">
          كاشير مأكولات أهلنا
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto d-flex flex-row gap-3">

            <Nav.Link as={Link} to="/login">
              تسجيل الدخول
            </Nav.Link>

            <Nav.Link as={Link} to="/">
              الكاشير
            </Nav.Link>

            <Nav.Link as={Link} to="/orders">
              الطلبات
            </Nav.Link>

          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  )
}