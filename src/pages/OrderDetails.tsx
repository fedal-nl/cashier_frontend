import {
  type CSSProperties,
  useEffect,
  useState,
} from "react"

import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap"
import { Link, useParams } from "react-router-dom"

import { ORDER_STATUS_LABELS } from "../constants/orderstatus"
import {
  fetchOrder,
  type OrderDetail,
} from "../services/orders"
import { formatCurrency } from "../utils/formatters"

function getStatusLabel(status: string) {
  return (
    ORDER_STATUS_LABELS[
      status as keyof typeof ORDER_STATUS_LABELS
    ] ?? status
  )
}

const PRINT_FONT_SIZE_OPTIONS = [
  {
    label: "صغير",
    value: "9px",
  },
  {
    label: "عادي",
    value: "10px",
  },
  {
    label: "كبير",
    value: "11px",
  },
  {
    label: "كبير جداً",
    value: "12px",
  },
]

export default function OrderDetails() {
  const { orderId } = useParams()

  const [order, setOrder] =
    useState<OrderDetail | null>(null)

  const [
    printFontSize,
    setPrintFontSize,
  ] = useState("10px")

  const [loading, setLoading] =
    useState(Boolean(orderId))

  const [error, setError] =
    useState<string | null>(
      orderId ? null : "رقم الطلب غير موجود"
    )

  useEffect(() => {
    if (!orderId) {
      return
    }

    fetchOrder(orderId)
      .then(setOrder)
      .catch((err) => {
        console.error(err)
        setError("تعذر تحميل تفاصيل الطلب")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error ?? "تعذر تحميل الطلب"}
        </Alert>
      </Container>
    )
  }

  const printPageStyle = {
    "--order-print-font-size":
      printFontSize,
  } as CSSProperties

  return (
    <Container
      className="order-print-page py-4"
      dir="rtl"
      style={printPageStyle}
    >
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 no-print">
        <div>
          <h2 className="mb-2">
            تفاصيل الطلب
          </h2>
          <div className="text-muted">
            #{order.id.slice(0, 8)}
          </div>
        </div>

        <Link
          to="/orders"
          className="btn btn-outline-secondary"
        >
          العودة للطلبات
        </Link>
      </div>

      <Card className="mb-4 print-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h3 className="mb-2">
                كاشير مأكولات أهلنا
              </h3>
              <div className="text-muted">
                إيصال طلب
              </div>
            </div>

            <div className="text-start">
              <div className="fw-bold">
                #{order.id.slice(0, 8)}
              </div>
              <div className="text-muted">
                {new Date(
                  order.created_at
                ).toLocaleString("ar-IQ")}
              </div>
              <div>
                {getStatusLabel(order.status)}
              </div>
            </div>
          </div>

          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    بيانات العميل
                  </Card.Title>
                  <div>
                    الاسم: {order.customer.name}
                  </div>
                  <div>
                    الهاتف:{" "}
                    {order.customer.phone_number ||
                      "-"}
                  </div>
                  <div>
                    البريد:{" "}
                    {order.customer.email || "-"}
                  </div>
                  <div>
                    العنوان:{" "}
                    {order.customer.address || "-"}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    بيانات الطلب
                  </Card.Title>
                  <div>
                    الفرع:{" "}
                    {order.branch?.name ?? "-"}
                  </div>
                  <div>
                    الموقع:{" "}
                    {order.branch?.location ?? "-"}
                  </div>
                  <div>
                    شركة التوصيل:{" "}
                    {order.delivery_company?.name ??
                      "-"}
                  </div>
                  <div>
                    ملاحظة: {order.note || "-"}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <h4 className="mb-3">
            عناصر الطلب
          </h4>

          <Table
            bordered
            responsive
            className="align-middle"
          >
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>التعديلات</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-bold">
                      {item.menu_item_name_ar}
                    </div>
                    {item.order_item_note && (
                      <div className="text-muted small">
                        {item.order_item_note}
                      </div>
                    )}
                  </td>
                  <td>{item.quantity}</td>
                  <td>
                    {formatCurrency(
                      Number(
                        item.menu_item_base_price
                      )
                    )}
                  </td>
                  <td>
                    {item.modifications.length ===
                    0 ? (
                      "-"
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        {item.modifications.map(
                          (modification) => (
                            <span
                              key={modification.id}
                              className="small"
                            >
                              {modification.modification_type ===
                              "added"
                                ? "+"
                                : "-"}{" "}
                              {
                                modification.ingredient_name_ar
                              }
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {formatCurrency(
                      Number(item.total_price)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end mt-4">
            <div className="order-total-box">
              <div className="text-muted">
                الإجمالي
              </div>
              <div className="fs-4 fw-bold">
                {formatCurrency(
                  Number(order.total_price)
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex flex-wrap justify-content-center align-items-end gap-3 no-print">
        <Form.Group controlId="printFontSize">
          <Form.Label>
            حجم خط الطباعة
          </Form.Label>
          <Form.Select
            value={printFontSize}
            onChange={(event) =>
              setPrintFontSize(
                event.target.value
              )
            }
          >
            {PRINT_FONT_SIZE_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </Form.Select>
        </Form.Group>

        <Button
          size="lg"
          onClick={() => window.print()}
        >
          طباعة الطلب
        </Button>
      </div>
    </Container>
  )
}
