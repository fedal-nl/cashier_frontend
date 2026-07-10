import {
  useCallback,
  useEffect,
  useMemo,
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

import { ORDER_STATUS_LABELS } from "../constants/orderstatus"
import {
  fetchBranches,
  type Branch,
} from "../services/api"
import {
  fetchDailyReports,
  type DailyReportRow,
} from "../services/reports"
import { formatCurrency } from "../utils/formatters"

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDefaultDateFrom() {
  const date = new Date()
  date.setDate(date.getDate() - 6)

  return toDateInputValue(date)
}

function preventManualInput(
  event: React.KeyboardEvent<HTMLInputElement>
) {
  if (event.key !== "Tab") {
    event.preventDefault()
  }
}

export default function Reports() {
  const [dateFrom, setDateFrom] =
    useState(getDefaultDateFrom)

  const [dateTo, setDateTo] =
    useState(() => toDateInputValue(new Date()))

  const [branches, setBranches] =
    useState<Branch[]>([])

  const [selectedBranchId, setSelectedBranchId] =
    useState("")

  const [selectedStatus, setSelectedStatus] =
    useState("")

  const [rows, setRows] =
    useState<DailyReportRow[]>([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const totals = useMemo(() => {
    return rows.reduce(
      (summary, row) => ({
        orders:
          summary.orders + row.total_orders,
        revenue:
          summary.revenue +
          Number(row.total_revenue),
        newCustomers:
          summary.newCustomers +
          row.total_new_customers_ordered,
        existingCustomers:
          summary.existingCustomers +
          row.total_existing_customers_ordered,
      }),
      {
        orders: 0,
        revenue: 0,
        newCustomers: 0,
        existingCustomers: 0,
      }
    )
  }, [rows])

  async function loadReports() {
    if (dateFrom > dateTo) {
      setError(
        "تاريخ البداية يجب أن يكون قبل تاريخ النهاية"
      )
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchDailyReports(
        dateFrom,
        dateTo,
        {
          branchId: selectedBranchId,
          status: selectedStatus,
        }
      )

      setRows(data)
    } catch (err) {
      console.error(err)
      setError("تعذر تحميل التقارير")
    } finally {
      setLoading(false)
    }
  }

  const loadBranches = useCallback(async () => {
    if (branches.length > 0) {
      return
    }

    try {
      const data = await fetchBranches()
      setBranches(data)
    } catch (err) {
      console.error(err)
      setError("تعذر تحميل الفروع")
    }
  }, [branches.length])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  return (
    <Container
      className="py-4"
      dir="rtl"
    >
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="mb-2">
            التقارير
          </h2>
          <p className="text-muted">
            ملخص الطلبات والعملاء والإيرادات حسب اليوم
          </p>
        </div>

        <div className="d-flex flex-column flex-sm-row flex-wrap gap-2">
          <Form.Group>
            <Form.Label>
              من تاريخ
            </Form.Label>
            <Form.Control
              type="date"
              value={dateFrom}
              onKeyDown={preventManualInput}
              onPaste={(event) =>
                event.preventDefault()
              }
              onBeforeInput={(event) =>
                event.preventDefault()
              }
              onChange={(event) =>
                setDateFrom(
                  event.target.value
                )
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>
              إلى تاريخ
            </Form.Label>
            <Form.Control
              type="date"
              value={dateTo}
              onKeyDown={preventManualInput}
              onPaste={(event) =>
                event.preventDefault()
              }
              onBeforeInput={(event) =>
                event.preventDefault()
              }
              onChange={(event) =>
                setDateTo(
                  event.target.value
                )
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>
              الفرع
            </Form.Label>
            <Form.Select
              value={selectedBranchId}
              onChange={(event) =>
                setSelectedBranchId(
                  event.target.value
                )
              }
            >
              <option value="">
                كل الفروع
              </option>
              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                  {branch.location
                    ? ` - ${branch.location}`
                    : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>
              الحالة
            </Form.Label>
            <Form.Select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
            >
              <option value="">
                كل الحالات
              </option>
              {Object.entries(
                ORDER_STATUS_LABELS
              ).map(([status, label]) => (
                <option
                  key={status}
                  value={status}
                >
                  {label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button
            className="align-self-sm-end"
            onClick={loadReports}
            disabled={loading}
          >
            عرض التقرير
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
        >
          {error}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="h-100 text-end">
            <Card.Body>
              <Card.Text className="text-muted">
                إجمالي الطلبات
              </Card.Text>
              <Card.Title>
                {totals.orders}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-end">
            <Card.Body>
              <Card.Text className="text-muted">
                إجمالي الإيرادات
              </Card.Text>
              <Card.Title>
                {formatCurrency(totals.revenue)}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-end">
            <Card.Body>
              <Card.Text className="text-muted">
                عملاء جدد طلبوا
              </Card.Text>
              <Card.Title>
                {totals.newCustomers}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 text-end">
            <Card.Body>
              <Card.Text className="text-muted">
                عملاء حاليون طلبوا
              </Card.Text>
              <Card.Title>
                {totals.existingCustomers}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="py-5 text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          className="align-middle"
        >
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الفرع</th>
              <th>إجمالي الطلبات</th>
              <th>الحالات</th>
              <th>عملاء جدد</th>
              <th>عملاء حاليون</th>
              <th>الإيرادات</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.date}-${row.branch_id}`}
              >
                <td>{row.date}</td>
                <td>{row.branch_name}</td>
                <td>{row.total_orders}</td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(
                      ORDER_STATUS_LABELS
                    ).map(([status, label]) => (
                      <span
                        key={status}
                        className="badge bg-secondary"
                      >
                        {label}:{" "}
                        {row.orders_by_status[
                          status
                        ] ?? 0}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {row.total_new_customers_ordered}
                </td>
                <td>
                  {
                    row.total_existing_customers_ordered
                  }
                </td>
                <td>
                  {formatCurrency(
                    Number(row.total_revenue)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
}
