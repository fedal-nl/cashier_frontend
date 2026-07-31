import { Container, Row, Col, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"

export default function Home() {
  const { canViewReports, canViewOrderLogs } = useAuth()

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">
        مرحباً بك في نظام الكاشير
      </h1>

      <Row className="g-4">
        <Col md={4}>
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

        <Col md={4}>
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

        {canViewReports && (
          <Col md={4}>
            <Card
              as={Link}
              to="/reports"
              className="p-5 text-center text-decoration-none shadow"
            >
              <h3>التقارير</h3>
              <p>
                متابعة المبيعات والعملاء
              </p>
            </Card>
          </Col>
        )}

        {canViewOrderLogs && (
          <Col md={4}>
            <Card
              as={Link}
              to="/order-logs"
              className="p-5 text-center text-decoration-none shadow"
            >
              <h3>سجل الطلبات</h3>
              <p>مراجعة تعديلات الطلبات والأسعار</p>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  )
}
