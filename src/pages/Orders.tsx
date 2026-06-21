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
  Modal,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap"

import OrdersTable from "../components/OrdersTable"
import type { Order } from "../components/OrdersTable"
import { ORDER_STATUS_LABELS } from "../constants/orderstatus"
import { formatCurrency } from "../utils/formatters"

import {
  fetchDeliveryCompanies,
  fetchOrders,
  fetchTodayOrderSummary,
  type DeliveryCompany,
  type TodayOrderSummary,
  updateOrderStatus,
} from "../services/orders"

type PendingStatusChange = {
  orderId: string
  currentStatus: string
  nextStatus: string
}

const PAGE_SIZE_OPTIONS = [
  10,
  25,
  50,
]

export default function Orders() {
  const [orders, setOrders] =
    useState<Order[]>([])

  const [search, setSearch] =
    useState("")

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("")

  const [currentPage, setCurrentPage] =
    useState(1)

  const [pageSize, setPageSize] =
    useState(10)

  const [loadingOrders, setLoadingOrders] =
    useState(true)

  const [totalOrders, setTotalOrders] =
    useState(0)

  const [
    todaySummary,
    setTodaySummary,
  ] = useState<TodayOrderSummary | null>(
    null
  )

  const [
    deliveryCompanies,
    setDeliveryCompanies,
  ] = useState<DeliveryCompany[]>([])

  const [
    selectedDeliveryCompanyId,
    setSelectedDeliveryCompanyId,
  ] = useState("")

  const [
    pendingStatusChange,
    setPendingStatusChange,
  ] = useState<PendingStatusChange | null>(
    null
  )

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const loadOrders = useCallback(
    async (
      searchValue = appliedSearch
    ) => {
      setLoadingOrders(true)

      try {
        const data =
          await fetchOrders(
            {
              search: searchValue,
              page: currentPage,
              pageSize,
            }
          )

        setOrders(data.results)
        setTotalOrders(data.count)
      } finally {
        setLoadingOrders(false)
      }
    },
    [
      appliedSearch,
      currentPage,
      pageSize,
    ]
  )

  const loadTodaySummary =
    useCallback(async () => {
      const data =
        await fetchTodayOrderSummary()

      setTodaySummary(data)
    }, [])

  useEffect(() => {
    let isActive = true

    fetchOrders({
      search: appliedSearch,
      page: currentPage,
      pageSize,
    })
      .then((data) => {
        if (isActive) {
          setOrders(data.results)
          setTotalOrders(data.count)
        }
      })
      .catch((err) => {
        console.error(err)
        if (isActive) {
          setError(
            "تعذر تحميل الطلبات"
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingOrders(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [
    currentPage,
    appliedSearch,
    pageSize,
  ])

  useEffect(() => {
    let isActive = true

    fetchDeliveryCompanies()
      .then((data) => {
        if (isActive) {
          setDeliveryCompanies(data)
        }
      })
      .catch((err) => {
        console.error(err)
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    loadTodaySummary().catch((err) => {
      console.error(err)
    })
  }, [loadTodaySummary])

  const todayStatusTotals =
    useMemo(() => {
      const totals = Object.keys(
        ORDER_STATUS_LABELS
      ).reduce<Record<string, number>>(
        (acc, status) => {
          acc[status] = 0
          return acc
        },
        {}
      )

      if (!todaySummary) {
        return totals
      }

      Object.entries(
        todaySummary.orders_by_status
      ).forEach(([status, count]) => {
        totals[status] = count
      })

      return totals
    }, [todaySummary])

  const todayOrdersTotal =
    todaySummary?.total_orders ?? 0

  const todayRevenue = Number(
    todaySummary?.total_revenue ?? 0
  )

  const todayNewCustomers =
    todaySummary?.total_new_customers_ordered ??
    0

  const todayExistingCustomers =
    todaySummary
      ?.total_existing_customers_ordered ??
    0

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalOrders / pageSize
    )
  )

  const firstOrderNumber =
    totalOrders === 0
      ? 0
      : (currentPage - 1) * pageSize + 1

  const lastOrderNumber = Math.min(
    currentPage * pageSize,
    totalOrders
  )

  const paginationItems =
    useMemo(() => {
      const items: number[] = []
      const start = Math.max(
        1,
        currentPage - 2
      )
      const end = Math.min(
        totalPages,
        currentPage + 2
      )

      for (
        let page = start;
        page <= end;
        page += 1
      ) {
        items.push(page)
      }

      return items
    }, [currentPage, totalPages])

  function handleSearchSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()
    setAppliedSearch(
      search.trim()
    )
    setCurrentPage(1)
  }

  function handlePageSizeChange(
    value: string
  ) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  async function handleStatusChange(
    id: string,
    status: string
  ) {
    const order = orders.find(
      (item) => item.id === id
    )

    if (
      !order ||
      order.status === status
    ) {
      return
    }

    setMessage(null)
    setError(null)
    setPendingStatusChange({
      orderId: id,
      currentStatus: order.status,
      nextStatus: status,
    })
    setSelectedDeliveryCompanyId("")
  }

  function closeStatusDialog() {
    if (updatingStatus) {
      return
    }

    setPendingStatusChange(null)
    setSelectedDeliveryCompanyId("")
  }

  async function confirmStatusChange() {
    if (!pendingStatusChange) {
      return
    }

    setUpdatingStatus(true)
    setMessage(null)
    setError(null)

    try {
      const payload = {
        status:
          pendingStatusChange.nextStatus,
        ...(selectedDeliveryCompanyId && {
          delivery_company_id: Number(
            selectedDeliveryCompanyId
          ),
        }),
      }

      await updateOrderStatus(
        pendingStatusChange.orderId,
        payload
      )

      setMessage(
        "تم تحديث حالة الطلب بنجاح"
      )
      setPendingStatusChange(null)
      setSelectedDeliveryCompanyId("")
      await Promise.all([
        loadOrders(),
        loadTodaySummary(),
      ])
    } catch (err) {
      console.error(err)
      setError(
        "تعذر تحديث حالة الطلب"
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  function getStatusLabel(
    status: string
  ) {
    return (
      ORDER_STATUS_LABELS[
        status as keyof typeof ORDER_STATUS_LABELS
      ] ?? status
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        الطلبات
      </h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between mb-3">
            <div>
              <h5 className="mb-1">
                طلبات اليوم حسب الحالة
              </h5>
              <div className="text-muted small">
                إجمالي طلبات اليوم:{" "}
                {todayOrdersTotal}
                <span className="mx-2">
                  |
                </span>
                إجمالي إيرادات اليوم:{" "}
                {formatCurrency(todayRevenue)}
                <span className="mx-2">
                  |
                </span>
                عملاء جدد:{" "}
                {todayNewCustomers}
                <span className="mx-2">
                  |
                </span>
                عملاء حاليون:{" "}
                {todayExistingCustomers}
              </div>
            </div>
          </div>

          <Row className="g-3">
            {Object.entries(
              ORDER_STATUS_LABELS
            ).map(
              ([status, label]) => (
                <Col
                  key={status}
                  xs={6}
                  md={4}
                  xl={3}
                >
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small mb-2">
                      {label}
                    </div>
                    <div className="fs-4 fw-bold">
                      {todayStatusTotals[
                        status
                      ] ?? 0}
                    </div>
                  </div>
                </Col>
              )
            )}
          </Row>
        </Card.Body>
      </Card>

      {message && (
        <Alert
          variant="success"
          onClose={() => setMessage(null)}
          dismissible
        >
          {message}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
        >
          {error}
        </Alert>
      )}

      <Form
        className="mb-3"
        onSubmit={handleSearchSubmit}
      >
        <Row className="g-2 align-items-end">
          <Col md={7} lg={8}>
            <Form.Label>
              بحث برقم الطلب أو اسم العميل
            </Form.Label>
            <Form.Control
              placeholder="اكتب رقم الطلب أو اسم العميل ثم اضغط بحث"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </Col>

          <Col md={3} lg={2}>
            <Form.Label>
              عدد الصفوف
            </Form.Label>
            <Form.Select
              value={pageSize}
              onChange={(event) =>
                handlePageSizeChange(
                  event.target.value
                )
              }
            >
              {PAGE_SIZE_OPTIONS.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                )
              )}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Button
              type="submit"
              className="w-100"
              disabled={loadingOrders}
            >
              بحث
            </Button>
          </Col>
        </Row>
      </Form>

      {loadingOrders ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <OrdersTable
            orders={orders}
            onStatusChange={
              handleStatusChange
            }
          />

          <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center mt-3">
            <div className="text-muted small">
              عرض {firstOrderNumber} إلى{" "}
              {lastOrderNumber} من{" "}
              {totalOrders} طلب
            </div>

            <Pagination className="mb-0">
              <Pagination.First
                onClick={() =>
                  setCurrentPage(1)
                }
                disabled={
                  currentPage === 1
                }
              />
              <Pagination.Prev
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
              />

              {paginationItems[0] > 1 && (
                <Pagination.Ellipsis disabled />
              )}

              {paginationItems.map(
                (page) => (
                  <Pagination.Item
                    key={page}
                    active={
                      page === currentPage
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </Pagination.Item>
                )
              )}

              {paginationItems[
                paginationItems.length - 1
              ] < totalPages && (
                <Pagination.Ellipsis disabled />
              )}

              <Pagination.Next
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                disabled={
                  currentPage === totalPages
                }
              />
              <Pagination.Last
                onClick={() =>
                  setCurrentPage(
                    totalPages
                  )
                }
                disabled={
                  currentPage === totalPages
                }
              />
            </Pagination>
          </div>
        </>
      )}

      <Modal
        show={Boolean(
          pendingStatusChange
        )}
        onHide={closeStatusDialog}
        centered
        dir="rtl"
      >
        <Modal.Header>
          <Modal.Title>
            تأكيد تغيير الحالة
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {pendingStatusChange && (
            <>
              <p className="mb-3">
                هل تريد تغيير حالة الطلب{" "}
                <strong>
                  {pendingStatusChange.orderId.slice(
                    0,
                    8
                  )}
                </strong>
                ؟
              </p>

              <div className="d-flex gap-2 justify-content-center">
                <span className="badge bg-secondary">
                  {getStatusLabel(
                    pendingStatusChange.currentStatus
                  )}
                </span>
                <span>
                  ←
                </span>
                <span className="badge bg-primary">
                  {getStatusLabel(
                    pendingStatusChange.nextStatus
                  )}
                </span>
              </div>

              <Form.Group className="mt-4">
                <Form.Label>
                  شركة التوصيل
                </Form.Label>

                <Form.Select
                  value={
                    selectedDeliveryCompanyId
                  }
                  onChange={(event) =>
                    setSelectedDeliveryCompanyId(
                      event.target.value
                    )
                  }
                  disabled={updatingStatus}
                >
                  <option value="">
                    بدون تغيير
                  </option>

                  {deliveryCompanies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name ||
                          `شركة رقم ${company.id}`}
                      </option>
                    )
                  )}
                </Form.Select>

                {deliveryCompanies.length ===
                  0 && (
                  <div className="text-muted small mt-2">
                    لا توجد شركات توصيل متاحة
                  </div>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={closeStatusDialog}
            disabled={updatingStatus}
          >
            إلغاء
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={confirmStatusChange}
            disabled={
              updatingStatus
            }
          >
            {updatingStatus ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="ms-2"
                />
                جار التحديث
              </>
            ) : (
              "تأكيد التغيير"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
