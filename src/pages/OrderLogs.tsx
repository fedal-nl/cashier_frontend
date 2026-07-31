import { useEffect, useState } from "react"
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap"

import { ORDER_STATUS_LABELS } from "../constants/orderstatus"
import {
  fetchOrderLogs,
  type OrderLog,
  type OrderSnapshot,
} from "../services/orderLogs"
import { formatCurrency } from "../utils/formatters"

const EVENT_LABELS: Record<OrderLog["event_type"], string> = {
  created: "إنشاء الطلب",
  status_updated: "تغيير الحالة",
  modified: "تعديل الطلب",
}

function statusLabel(status: string | null) {
  if (!status) return "-"
  return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status
}

function price(snapshot?: OrderSnapshot) {
  return snapshot ? Number(snapshot.total_price) : null
}

function PriceChange({ log }: { log: OrderLog }) {
  const before = price(log.changes.before)
  const after = price(log.changes.after)

  if (after === null) return <span>-</span>
  if (before === null) return <span>{formatCurrency(after)}</span>

  const changed = before !== after
  return (
    <div className={changed ? "fw-bold text-danger" : "text-muted"}>
      {formatCurrency(before)} ← {formatCurrency(after)}
    </div>
  )
}

function SnapshotItems({ title, snapshot }: { title: string; snapshot?: OrderSnapshot }) {
  if (!snapshot) return null

  return (
    <Card className="h-100">
      <Card.Header className="fw-bold">{title}</Card.Header>
      <Card.Body>
        <div className="mb-2">
          وقت إنشاء الطلب:{" "}
          <strong>
            {snapshot.created_at
              ? new Date(snapshot.created_at).toLocaleString("ar-IQ")
              : "غير متاح للسجلات القديمة"}
          </strong>
        </div>
        <div className="mb-3">
          وقت تحديث حالة الطلب:{" "}
          <strong>
            {snapshot.updated_at
              ? new Date(snapshot.updated_at).toLocaleString("ar-IQ")
              : "غير متاح للسجلات القديمة"}
          </strong>
        </div>
        <div className="mb-3">
          السعر الإجمالي: <strong>{formatCurrency(Number(snapshot.total_price))}</strong>
        </div>
        {snapshot.items.length === 0 ? (
          <div className="text-muted">لا توجد أصناف</div>
        ) : (
          <Table bordered size="sm" responsive>
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>السعر الأساسي</th>
                <th>الإجمالي</th>
                <th>التعديلات</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.items.map((item, index) => (
                <tr key={`${item.menu_item_id}-${index}`}>
                  <td>{item.name_ar}</td>
                  <td className="fw-bold">{item.quantity}</td>
                  <td>{formatCurrency(Number(item.base_price))}</td>
                  <td>{formatCurrency(Number(item.total_price))}</td>
                  <td>
                    {item.modifications.length === 0
                      ? "-"
                      : item.modifications.map((modification, modificationIndex) => (
                          <div key={`${modification.ingredient_id}-${modificationIndex}`}>
                            {modification.name_ar} ({modification.type}) × {modification.quantity}
                          </div>
                        ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

export default function OrderLogs() {
  const [logs, setLogs] = useState<OrderLog[]>([])
  const [status, setStatus] = useState("")
  const [eventType, setEventType] = useState<OrderLog["event_type"] | "">("")
  const [orderId, setOrderId] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<OrderLog | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const pageSize = 25

  async function loadLogs(page = currentPage) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrderLogs({
          status,
          eventType,
          orderId: orderId.trim(),
          lastUpdated,
          page,
          pageSize,
        })
      setLogs(data.results)
      setTotalLogs(data.count)
      setCurrentPage(page)
    } catch (requestError) {
      console.error(requestError)
      setError("تعذر تحميل سجل الطلبات. تحقق من قيم البحث وحاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs()
    }, 0)

    return () => window.clearTimeout(timeoutId)
    // Initial load only; filters are applied explicitly with the search button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    void loadLogs(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))

  return (
    <Container fluid className="py-4" dir="rtl">
      <h2 className="mb-4">سجل أحداث الطلبات</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={submit}>
            <Row className="g-3 align-items-end">
              <Col lg={2}>
                <Form.Label>نوع الحدث</Form.Label>
                <Form.Select
                  value={eventType}
                  onChange={(event) =>
                    setEventType(event.target.value as OrderLog["event_type"] | "")
                  }
                >
                  <option value="">كل الأحداث</option>
                  {Object.entries(EVENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Label>حالة الطلب</Form.Label>
                <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">كل الحالات</option>
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={3}>
                <Form.Label>رقم الطلب الكامل</Form.Label>
                <Form.Control
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="UUID"
                  dir="ltr"
                />
              </Col>
              <Col lg={3}>
                <Form.Label>آخر تحديث</Form.Label>
                <Form.Control
                  type="date"
                  value={lastUpdated}
                  onChange={(event) => setLastUpdated(event.target.value)}
                />
              </Col>
              <Col lg={2}>
                <Button type="submit" className="w-100" disabled={loading}>بحث</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
        <div className="text-muted mb-2">إجمالي الأحداث: {totalLogs}</div>
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>الوقت</th>
              <th>الطلب</th>
              <th>الحدث</th>
              <th>الحالة</th>
              <th>المستخدم</th>
              <th>تغيير السعر</th>
              <th>التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-4">لا توجد أحداث</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString("ar-IQ")}</td>
                <td dir="ltr">{log.order_id.slice(0, 8)}</td>
                <td><Badge bg={log.event_type === "modified" ? "warning" : "primary"}>{EVENT_LABELS[log.event_type]}</Badge></td>
                <td>{statusLabel(log.new_status)}</td>
                <td>{log.created_by_username ?? "النظام"}</td>
                <td><PriceChange log={log} /></td>
                <td><Button size="sm" variant="outline-primary" onClick={() => setSelectedLog(log)}>عرض</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <Pagination className="justify-content-center">
            <Pagination.First
              disabled={currentPage === 1 || loading}
              onClick={() => void loadLogs(1)}
            />
            <Pagination.Prev
              disabled={currentPage === 1 || loading}
              onClick={() => void loadLogs(currentPage - 1)}
            />
            <Pagination.Item active>{currentPage} / {totalPages}</Pagination.Item>
            <Pagination.Next
              disabled={currentPage === totalPages || loading}
              onClick={() => void loadLogs(currentPage + 1)}
            />
            <Pagination.Last
              disabled={currentPage === totalPages || loading}
              onClick={() => void loadLogs(totalPages)}
            />
          </Pagination>
        )}
        </>
      )}

      <Modal show={Boolean(selectedLog)} onHide={() => setSelectedLog(null)} size="xl" centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الحدث</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <>
              <Row className="g-3 mb-4">
                <Col md={4}><strong>الطلب:</strong> <span dir="ltr">{selectedLog.order_id}</span></Col>
                <Col md={4}><strong>المستخدم:</strong> {selectedLog.created_by_username ?? "النظام"}</Col>
                <Col md={4}>
                  <strong>وقت إنشاء الحدث:</strong>{" "}
                  {new Date(selectedLog.created_at).toLocaleString("ar-IQ")}
                </Col>
                <Col md={4}><strong>الحدث:</strong> {EVENT_LABELS[selectedLog.event_type]}</Col>
                <Col md={4}><strong>الحالة السابقة:</strong> {statusLabel(selectedLog.previous_status)}</Col>
                <Col md={4}><strong>الحالة الجديدة:</strong> {statusLabel(selectedLog.new_status)}</Col>
              </Row>
              <Row className="g-3">
                <Col lg={6}><SnapshotItems title="قبل التغيير" snapshot={selectedLog.changes.before} /></Col>
                <Col lg={6}><SnapshotItems title="بعد التغيير" snapshot={selectedLog.changes.after} /></Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}
