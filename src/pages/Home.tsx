import { Container, Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">
        مرحباً بك في نظام الكاشير
      </h1>

      <Row className="g-4">
        <Col md={6}>
          <Card
            as={Link}
            to="/cashier"
            className="p-5 text-center text-decoration-none shadow"
          >
            <h3>الكاشير</h3>
            <p>
              إنشاء طلب جديد
            </p>
          </Card>
        </Col>

        <Col md={6}>
          <Card
            as={Link}
            to="/orders"
            className="p-5 text-center text-decoration-none shadow"
          >
            <h3>الطلبات</h3>
            <p>
              متابعة حالة الطلبات
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}